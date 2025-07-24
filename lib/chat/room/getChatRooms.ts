/**
 * File Name : lib/chat/room/getChatRooms
 * Description : 모든 채팅방 불러오기
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2025.07.13  임도헌   Created   채팅 목록 fetch 로직 분리
 */
"use server";

import db from "@/lib/db";
import { ChatRoom } from "@/types/chat";

/**
 * getChatRooms
 * - 로그인된 사용자가 참여 중인 모든 채팅방을 가져옵니다.
 * - 각 채팅방에는 다음 정보가 포함됩니다:
 *   - 상대방 유저 정보
 *   - 해당 제품의 대표 정보 (제목, 이미지)
 *   - 마지막 메시지 1건
 *
 * userId - 현재 로그인한 사용자 ID
 * @returns ChatRoom[] - 채팅방 목록
 */
export async function getChatRooms(userId: number): Promise<ChatRoom[]> {
  const chatRooms = await db.productChatRoom.findMany({
    where: {
      users: {
        some: { id: userId }, // 현재 사용자가 포함된 채팅방
      },
    },
    include: {
      users: {
        where: { NOT: { id: userId } }, // 상대방 유저 정보만 가져오기
        select: { id: true, username: true, avatar: true },
      },
      product: {
        select: {
          id: true,
          title: true,
          images: {
            where: { order: 0 }, // 대표 이미지 (order: 0)
            select: { url: true },
            take: 1,
          },
        },
      },
      messages: {
        orderBy: { created_at: "desc" }, // 최신 메시지 기준 정렬
        take: 1, // 마지막 메시지 1개만 가져오기
        select: {
          id: true,
          payload: true,
          created_at: true,
          isRead: true,
          productChatRoomId: true,
          user: {
            select: { id: true, username: true, avatar: true },
          },
        },
      },
    },
    orderBy: {
      updated_at: "desc", // 채팅방 최신 업데이트 기준 정렬
    },
  });

  // Prisma 쿼리 결과 → 프론트용 데이터 구조로 변환
  return chatRooms.map((room) => ({
    id: room.id,
    created_at: room.created_at,
    updated_at: room.updated_at,
    product: {
      id: room.product.id,
      title: room.product.title,
      imageUrl: room.product.images[0]?.url ?? "", // 대표 이미지 URL
    },
    users: room.users, // 상대방 유저 정보
    lastMessage: room.messages[0]
      ? {
          id: room.messages[0].id,
          payload: room.messages[0].payload,
          created_at: room.messages[0].created_at,
          isRead: room.messages[0].isRead,
          productChatRoomId: room.messages[0].productChatRoomId!,
          user: room.messages[0].user,
        }
      : null,
  }));
}
