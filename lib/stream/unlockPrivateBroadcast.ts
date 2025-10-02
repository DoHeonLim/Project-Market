/**
 * File Name : lib/stream/unlockPrivateBroadcast
 * Description : PRIVATE 스트림/녹화본 비밀번호 해제 로직 + 세션 헬퍼
 * Author : 임도헌
 *
 * History
 * 2025.08.10  임도헌   Created   unlockPrivateStream
 * 2025.08.14  임도헌   Modified  iron-session에 stream_id 저장
 * 2025.08.21  임도헌   Modified  반환 타입을 { success, error? }로 통일
 * 2025.08.26  임도헌   Modified  errorCode 표준화 + 헬퍼 유지
 * 2025.08.30  임도헌   Modified  반환 타입을 유니온으로 변경({ success } | { success:false; error })
 * 2025.09.10  임도헌   Modified  이미 언락된 세션 빠른 종료, streamId 가드/상수 키/예외 방어 추가
 * 2025.09.16  임도헌   Modified  Broadcast 스키마 반영, 세션 키 리네이밍, 파일명 변경
 * 2025.09.17  임도헌   Modified  INTERNAL_ERROR로 서버 예외 구분, 구 키 삭제(선택) 처리, 로그 태그 정정
 */

import "server-only";
import db from "@/lib/db";
import getSession from "@/lib/session";
import bcrypt from "bcrypt";
import { UnlockResult } from "@/types/stream";

/** 세션 저장 키(신규/권장) */
const UNLOCK_SESSION_KEY_NEW = "unlockedBroadcastIds" as const;
/** 세션 저장 키(구/호환) */
const UNLOCK_SESSION_KEY_OLD = "unlockedStreamIds" as const;

/** 세션에 저장되는 구조(간단 Set) : { [broadcastId]: true } */
type UnlockSet = Record<string, true>;

function getUnlockSet(session: any): UnlockSet {
  // 새 키 우선, 없으면 구 키도 읽어서 합침(역호환)
  const newer: UnlockSet = session?.[UNLOCK_SESSION_KEY_NEW] ?? {};
  const older: UnlockSet = session?.[UNLOCK_SESSION_KEY_OLD] ?? {};
  return { ...older, ...newer };
}

/** 세션에서 PRIVATE 언락 여부 조회 */
export async function isBroadcastUnlocked(
  broadcastId: number
): Promise<boolean> {
  const session = await getSession();
  const unlocked = getUnlockSet(session);
  return !!unlocked[String(broadcastId)];
}

/**
 * 비공개 방송 해제
 * @param broadcastId 대상 방송 ID
 * @param password 평문 비밀번호
 */
export async function unlockPrivateBroadcast(
  broadcastId: number,
  password: string
): Promise<UnlockResult> {
  try {
    const session = await getSession();
    if (!session?.id) return { success: false, error: "NOT_LOGGED_IN" };

    // 입력 가드
    if (!Number.isFinite(broadcastId)) {
      return { success: false, error: "BAD_REQUEST" };
    }
    const pwd = (password ?? "").trim();
    if (!pwd) return { success: false, error: "MISSING_PASSWORD" };

    // 이미 언락된 세션이면 바로 성공
    const unlocked = getUnlockSet(session);
    if (unlocked[String(broadcastId)]) {
      return { success: true };
    }

    // ▶ Broadcast 기준으로 조회
    const b = await db.broadcast.findUnique({
      where: { id: broadcastId },
      select: { id: true, visibility: true, password: true },
    });
    if (!b) return { success: false, error: "STREAM_NOT_FOUND" };
    if (b.visibility !== "PRIVATE") {
      return { success: false, error: "NOT_PRIVATE_STREAM" };
    }
    if (!b.password) {
      return { success: false, error: "NO_PASSWORD_SET" };
    }

    const ok = await bcrypt.compare(pwd, b.password);
    if (!ok) return { success: false, error: "INVALID_PASSWORD" };

    // 세션에 언락 저장(신규 키로 저장, 구 키는 제거하여 마이그레이션 종료)
    const nextSet: UnlockSet = { ...unlocked, [String(broadcastId)]: true };
    (session as any)[UNLOCK_SESSION_KEY_NEW] = nextSet;
    delete (session as any)[UNLOCK_SESSION_KEY_OLD]; // 선택적: 구 키 정리
    await session.save();

    return { success: true };
  } catch (e) {
    console.error("[unlockPrivateBroadcast] error:", e);
    return { success: false, error: "INTERNAL_ERROR" };
  }
}
