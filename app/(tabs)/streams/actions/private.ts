/**
 * File Name : app/(tabs)/streams/actions/private
 * Description : private 스트리밍 해제 서버액션
 * Author : 임도헌
 *
 * History
 * 2025.08.26  임도헌   Created
 * 2025.08.30  임도헌   Modified  UnlockResult 유니온 타입 적용 및 에러코드 정규화
 * 2025.09.17  임도헌   Modified  서버 예외를 INTERNAL_ERROR로 통일
 */

"use server";

import { unlockPrivateBroadcast } from "@/lib/stream/unlockPrivateBroadcast";
import type { UnlockResult } from "@/types/stream";

export async function unlockPrivateStreamAction(
  streamId: number,
  password: string
): Promise<UnlockResult> {
  try {
    if (!Number.isFinite(streamId) || streamId <= 0) {
      return { success: false, error: "BAD_REQUEST" };
    }
    const pwd = (password ?? "").trim();
    if (!pwd) {
      return { success: false, error: "MISSING_PASSWORD" };
    }
    return await unlockPrivateBroadcast(streamId, pwd); // trim된 pwd 전달
  } catch (e) {
    console.error("[unlockPrivateStreamAction] error:", e);
    return { success: false, error: "INTERNAL_ERROR" };
  }
}
