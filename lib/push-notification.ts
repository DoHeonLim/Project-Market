/**
 * File Name : lib/push-notification
 * Description : 웹 푸시 알림 유틸리티 (tag/renotify/topic/TTL/urgency 지원)
 * Author : 임도헌
 *
 * History
 * 2024.12.20  임도헌   Created
 * 2024.12.22  임도헌   Modified  푸시 알림 라이브러리 추가
 * 2025.01.12  임도헌   Modified  푸시 알림 이미지 추가
 * 2025.11.10  임도헌   Modified  tag/renotify 페이로드 지원, 410 만료 처리 보강
 * 2025.11.10  임도헌   Modified  topic/urgency/TTL 추가, env 가드, payload 4KB 보호, 결과 리포트
 */

import webPush from "web-push";
import db from "@/lib/db";

type NotificationType = "CHAT" | "TRADE" | "REVIEW" | "SYSTEM" | "BADGE";

interface SendNotificationProps {
  targetUserId: number;
  title: string;
  message: string;
  url?: string;
  type: NotificationType;
  image?: string;
  /** 같은 tag면 기존 알림을 교체(덮어쓰기) */
  tag?: string;
  /** 교체 시에도 소리/진동 재생 */
  renotify?: boolean;
  /**
   * 네트워크 레벨에서 collapse 용도 (HTTP/2 Push "Topic" 헤더)
   * 명시 안 하면 tag와 동일하게 설정
   */
  topic?: string;
  /**
   * 알림 긴급도 (spec: very-low | low | normal | high)
   * 기본값은 type별 정책으로 자동 결정됨
   */
  urgency?: "very-low" | "low" | "normal" | "high";
  /**
   * TTL(초). 기본값은 type별 정책으로 자동 결정됨
   */
  ttlSeconds?: number;
}

/* ---------- ENV & web-push 초기화 (프로세스 생애주기 1회) ---------- */
const VAPID_PUB = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const VAPID_PRIV = process.env.VAPID_PRIVATE_KEY;

if (!VAPID_PUB || !VAPID_PRIV) {
  // 서버 부팅 시점에 즉시 경고
  console.warn(
    "[push] VAPID keys are not configured. Web Push will fail until set."
  );
} else {
  // idempotent: 같은 값으로 재설정하면 web-push가 문제 없이 동작
  webPush.setVapidDetails("mailto:admin@board-port.com", VAPID_PUB, VAPID_PRIV);
}

/* ---------- 타입별 기본 정책 ---------- */
function defaultTagByType(type: NotificationType, url?: string) {
  switch (type) {
    case "CHAT": {
      // 채팅방 기준으로 덮어쓰기 → /chats/:roomId 패턴이면 roomId로 태그 생성
      const m = url?.match(/\/chats\/([^/?#]+)/);
      return m ? `bp-chat-${m[1]}` : "bp-chat";
    }
    case "TRADE":
      // 동일 상품 트랜잭션 묶기 → /products/view/:id
      return "bp-trade";
    case "REVIEW":
      return "bp-review";
    case "BADGE":
      return "bp-badge";
    case "SYSTEM":
    default:
      return "bp-system";
  }
}

function defaultsFor(type: NotificationType) {
  // 긴급도/TTL은 UX 관점에서 합리적 기본치로 설정
  // CHAT은 실시간성이 중요 → high / 1시간
  // TRADE/REVIEW는 중요도 중간 → normal / 12시간
  // BADGE는 알림 축적되도 무방 → low / 24시간
  // SYSTEM은 가벼운 고지 → low / 6시간
  switch (type) {
    case "CHAT":
      return { urgency: "high" as const, ttlSeconds: 60 * 60 };
    case "TRADE":
    case "REVIEW":
      return { urgency: "normal" as const, ttlSeconds: 60 * 60 * 12 };
    case "BADGE":
      return { urgency: "low" as const, ttlSeconds: 60 * 60 * 24 };
    case "SYSTEM":
    default:
      return { urgency: "low" as const, ttlSeconds: 60 * 60 * 6 };
  }
}

/* ---------- 4KB payload 보호 ---------- */
function ensureMaxPayload(json: any): string {
  const text = JSON.stringify(json);
  // Node에서 문자열 길이는 코드 유닛 기준이라 대략 체크, 여유 버퍼를 둠(3800B)
  // 이미지 URL 등으로 4KB를 초과할 수 있어 본문을 우선 축약
  const MAX_BYTES = 3800;
  const encoder = new TextEncoder();
  let bytes = encoder.encode(text);
  if (bytes.byteLength <= MAX_BYTES) return text;

  // body만 줄여 재시도
  const clone = { ...json };
  if (typeof clone.body === "string") {
    let body = clone.body;
    // 120자 단위로 줄이면서 한도 맞추기
    while (body.length > 0) {
      body = body.slice(0, Math.max(0, body.length - 120)) + "…";
      clone.body = body;
      const t = JSON.stringify(clone);
      bytes = encoder.encode(t);
      if (bytes.byteLength <= MAX_BYTES) return t;
    }
  }

  // 그래도 크면 이미지 제거 후 최종 시도
  delete clone.image;
  const final = JSON.stringify(clone);
  return final.length <= MAX_BYTES
    ? final
    : JSON.stringify({ title: json.title, body: "…" });
}

export async function sendPushNotification({
  targetUserId,
  title,
  message,
  url,
  type,
  image,
  tag,
  renotify,
  topic,
  urgency,
  ttlSeconds,
}: SendNotificationProps) {
  try {
    if (!VAPID_PUB || !VAPID_PRIV) {
      // 환경변수 미설정 시 조용히 성공 처리(실서버에선 설정할 것이므로)
      console.error("[push] VAPID keys missing. Skipping send.");
      return { success: false, error: "VAPID_NOT_CONFIGURED" as const };
    }

    const subs = await db.pushSubscription.findMany({
      where: { userId: targetUserId, isActive: true },
    });

    if (!subs.length) {
      return { success: true, message: "No active subscriptions" };
    }

    const policy = defaultsFor(type);
    const resolvedTag = tag ?? defaultTagByType(type, url);
    const resolvedTopic = (topic ?? resolvedTag).slice(0, 32); // 일부 구현체는 topic 길이 제한
    const resolvedUrgency = urgency ?? policy.urgency;
    const resolvedTTL = ttlSeconds ?? policy.ttlSeconds;

    const payload = ensureMaxPayload({
      title,
      body: message,
      link: url,
      type,
      image,
      tag: resolvedTag,
      renotify: !!renotify,
    });

    const results = {
      sent: 0,
      removed: 0,
      disabled: 0,
      errors: 0,
    };

    await Promise.all(
      subs.map(async (sub) => {
        try {
          await webPush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: { p256dh: sub.p256dh, auth: sub.auth },
            },
            payload,
            {
              TTL: resolvedTTL,
              urgency: resolvedUrgency,
              topic: resolvedTopic,
            }
          );
          results.sent += 1;
          // 성공 시 마지막 사용 시간 갱신(선택)
          await db.pushSubscription.update({
            where: { id: sub.id },
            data: { last_used: new Date(), isActive: true },
          });
        } catch (err: any) {
          // 표준적인 만료/삭제 케이스
          if (err?.statusCode === 410 || err?.statusCode === 404) {
            results.removed += 1;
            await db.pushSubscription.delete({ where: { id: sub.id } });
          } else {
            // 과금/쿼터/페이로드 초과 등의 일시 오류
            results.disabled += 1;
            await db.pushSubscription
              .update({ where: { id: sub.id }, data: { isActive: false } })
              .catch(() => {});
          }
          results.errors += 1;
          console.error("WebPush error:", {
            status: err?.statusCode,
            body: err?.body,
            endpoint: sub.endpoint,
          });
        }
      })
    );

    return { success: true, ...results };
  } catch (error) {
    console.error("Send notification error:", error);
    throw error;
  }
}
