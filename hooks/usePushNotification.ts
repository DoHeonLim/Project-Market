/**
 * File Name : hooks/usePushNotification
 * Description : 푸시 알림 커스텀 훅 (next-pwa 자동 등록 전제)
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2024.12.20  임도헌   Created
 * 2024.12.20  임도헌   Modified  푸시 알림 커스텀 훅 추가
 * 2024.12.31  임도헌   Modified  푸시 알림 코드 리팩토링
 * 2025.11.10  임도헌   Modified  next-pwa 자동 SW 사용(수동 register 제거), 가드/토스트 보강
 */
"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

interface PushSubscriptionData {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

export function usePushNotification() {
  const [subscription, setSubscription] = useState<PushSubscriptionData | null>(
    null
  );
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isPrivateMode, setIsPrivateMode] = useState(false);

  // 지원 여부 초기화
  useEffect(() => {
    setIsSupported(checkSupport());
  }, []);

  // 현재 구독 상태 확인
  useEffect(() => {
    if (!isSupported) return;

    let mounted = true;
    const controller = new AbortController();

    const check = async () => {
      try {
        // Private 모드 감지
        try {
          localStorage.setItem("bp_push_probe", "1");
          localStorage.removeItem("bp_push_probe");
          if (mounted) setIsPrivateMode(false);
        } catch {
          if (mounted) setIsPrivateMode(true);
          return;
        }

        // next-pwa가 등록한 서비스워커 준비 대기
        const registration = await navigator.serviceWorker.ready;
        if (!mounted) return;

        const current = await registration.pushManager.getSubscription();
        if (!mounted) return;

        if (!current) {
          setIsSubscribed(false);
          return;
        }

        // 서버 검증
        const res = await fetch("/api/push/check-subscription", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: current.endpoint }),
          signal: controller.signal,
        });

        if (!mounted) return;

        if (res.ok) {
          const { isValid } = await res.json();
          if (!mounted) return;

          setIsSubscribed(!!isValid);
          if (isValid) {
            setSubscription(current.toJSON() as PushSubscriptionData);
          } else {
            // 유효하지 않으면 브라우저 구독 제거
            await current.unsubscribe();
          }
        } else {
          setIsSubscribed(false);
        }
      } catch (e) {
        if (!mounted) return;
        console.error("[push] check failed:", e);
        setIsSubscribed(false);
      }
    };

    check();

    return () => {
      mounted = false;
      controller.abort();
    };
  }, [isSupported]);

  // ────────────────────────────────────────────────────────────────────────────────
  // API
  // ────────────────────────────────────────────────────────────────────────────────

  const subscribe = async () => {
    try {
      if (!isSupported) {
        toast.error("이 브라우저는 푸시 알림을 지원하지 않습니다.");
        return;
      }
      if (isPrivateMode) {
        toast.error("프라이빗 모드에서는 푸시 알림을 사용할 수 없습니다.");
        return;
      }
      if (!navigator.onLine) {
        toast.error("오프라인 상태입니다. 인터넷 연결 후 다시 시도해주세요.");
        return;
      }

      // 권한 안내
      toast.info(
        "푸시 알림을 활성화하면 새 메시지/거래 알림을 받을 수 있어요."
      );

      // 이미 거부된 경우 빠른 종료
      if (Notification.permission === "denied") {
        toast.error(
          "브라우저 알림 권한이 차단되어 있습니다. 사이트 권한을 허용해주세요."
        );
        return;
      }

      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        toast.error(
          "알림 권한이 거부되었습니다. 브라우저 설정에서 허용해주세요."
        );
        return;
      }

      // next-pwa가 등록한 SW가 ready 상태여야 함
      const registration = await navigator.serviceWorker.ready;

      const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!publicKey) {
        toast.error("VAPID 공개키가 설정되지 않았습니다.");
        return;
      }

      // 기존 구독이 있으면 재사용(서버 동기화만)
      const existing = await registration.pushManager.getSubscription();
      if (existing) {
        const reused = existing.toJSON() as PushSubscriptionData;
        const resReuse = await fetch("/api/push/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(reused),
        });
        if (!resReuse.ok) {
          throw new Error(`서버 구독 동기화 실패(${resReuse.status})`);
        }
        setSubscription(reused);
        setIsSubscribed(true);
        toast.success("푸시 알림이 활성화되었습니다. (기존 구독 재사용)");
        return;
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });

      const payload = subscription.toJSON() as PushSubscriptionData;

      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        await subscription.unsubscribe().catch(() => {});
        throw new Error(`서버 구독 등록 실패(${res.status})`);
      }

      setSubscription(payload);
      setIsSubscribed(true);
      toast.success("푸시 알림이 활성화되었습니다.");
    } catch (e: any) {
      console.error("[push] subscribe failed:", e);
      toast.error(`푸시 알림 설정 실패: ${e?.message ?? "알 수 없는 오류"}`);
    }
  };

  const unsubscribe = async () => {
    try {
      if (!isSupported) return;

      const registration = await navigator.serviceWorker.ready;
      const current = await registration.pushManager.getSubscription();

      if (current) {
        // 서버 구독 삭제
        await fetch("/api/push/unsubscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: current.endpoint }),
        }).catch(() => {});

        // 브라우저 구독 해제
        await current.unsubscribe();
      }

      setSubscription(null);
      setIsSubscribed(false);
      toast.success("푸시 알림이 비활성화되었습니다.");
    } catch (e) {
      console.error("[push] unsubscribe failed:", e);
      toast.error("푸시 알림 해제에 실패했습니다.");
    }
  };

  return {
    isSupported,
    isSubscribed,
    isPrivateMode,
    subscription,
    subscribe,
    unsubscribe,
  };
}

// ────────────────────────────────────────────────────────────────────────────────
// utils
// ────────────────────────────────────────────────────────────────────────────────
function checkSupport() {
  try {
    return (
      "serviceWorker" in navigator &&
      "PushManager" in window &&
      "Notification" in window
    );
  } catch {
    return false;
  }
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}
