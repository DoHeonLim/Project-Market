/**
 * File Name : lib/chat/room/create/createStreamChatRoom
 * Description : 방송(Broadcast) 1:1 스트리밍 채팅방 생성 유틸 (idempotent)
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2025.07.30  임도헌   Created   스트리밍 생성 시 채팅방 연결 기능 분리
 * 2025.09.16  임도헌   Modified  LiveStream → Broadcast 기준으로 변경, upsert/idempotent, @unique(broadcastId) 전제
 */

import db from "@/lib/db";

/**
 * createStreamChatRoom
 * - Broadcast와 1:1로 연결된 채팅방 생성 (이미 있으면 재사용)
 * - 스키마 전제: StreamChatRoom.broadcastId 에 @unique
 */
export const createStreamChatRoom = async (broadcastId: number) => {
  try {
    // 고유 제약(@unique: broadcastId) 기반의 idempotent 생성
    const room = await db.streamChatRoom.upsert({
      where: { broadcastId },
      update: {}, // 이미 존재하면 그대로 사용
      create: {
        broadcast: { connect: { id: broadcastId } },
      },
      select: { id: true },
    });

    return { success: true as const, id: room.id };
  } catch (e: any) {
    // 만약 스키마에 @unique가 아직 없어서 upsert 불가하면, find → create(+P2002 재시도) 패턴으로 폴백
    if (e?.code === "P2002" || e?.message?.includes("Unique")) {
      try {
        const existing = await db.streamChatRoom.findUnique({
          where: { broadcastId },
          select: { id: true },
        });
        if (existing) return { success: true as const, id: existing.id };

        const created = await db.streamChatRoom.create({
          data: { broadcast: { connect: { id: broadcastId } } },
          select: { id: true },
        });
        return { success: true as const, id: created.id };
      } catch (err) {
        console.error("[createStreamChatRoom][fallback] failed:", err);
        return {
          success: false as const,
          error: "채팅방 생성에 실패했습니다.",
        };
      }
    }

    console.error("[createStreamChatRoom] failed:", e);
    return { success: false as const, error: "채팅방 생성에 실패했습니다." };
  }
};
