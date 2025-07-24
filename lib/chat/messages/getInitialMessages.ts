/**
 * File Name : lib/chat/getInitialMessages
 * Description : 채팅방 메시지 초기 목록 조회 로직
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2025.07.13  임도헌   Created   채팅방 메시지 초기 목록 조회 로직 분리
 * 2025.07.22  임도헌   Modified  DESC 정렬 후 reverse 로직 설명 추가
 */

import db from "@/lib/db";
import { ChatMessage } from "@/types/chat";

/**
 * getInitialMessages
 * - 채팅방 진입 시 초기 메시지 목록을 불러옴
 * - 최신 메시지 기준으로 limit 개수 조회
 * - 최종적으로 오래된 메시지 → 최신 메시지 순서로 반환
 */
export const getInitialMessages = async (
  chatRoomId: string,
  limit = 20
): Promise<ChatMessage[]> => {
  try {
    // DB에서 최신순(DESC)으로 limit 개수 가져오기
    const messages = await db.productMessage.findMany({
      where: {
        productChatRoomId: chatRoomId,
      },
      orderBy: { created_at: "desc" }, // 최신순 정렬
      take: limit, // 최신 메시지 limit 개수
      select: {
        id: true,
        payload: true,
        created_at: true,
        userId: true,
        isRead: true,
        user: {
          select: {
            id: true,
            avatar: true,
            username: true,
          },
        },
        productChatRoomId: true,
      },
    });

    // reverse() 이유
    // - DESC로 가져오면 최신 메시지가 배열 앞에 위치
    // - 채팅 UI는 오래된 → 최신 순서로 출력해야 자연스러움
    return messages.reverse();
  } catch (err) {
    console.error("getInitialMessages error:", err);
    return [];
  }
};
