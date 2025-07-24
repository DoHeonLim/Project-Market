/**
 * File Name : lib/chat/messages/getMoreMessages
 * Description : 과거 메시지 페이징 로드
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2025.07.16  임도헌   Created   과거 메시지 Server Action
 * 2025.07.22  임도헌   Modified  DESC 정렬 후 reverse 로직 설명 추가
 */
"use server";

import db from "@/lib/db";
import { ChatMessage } from "@/types/chat";

/**
 * getMoreMessages
 * - 무한스크롤 시 과거 메시지 페이징 로드
 * - 마지막 메시지 id(lastMessageId)를 기준으로 더 이전 메시지 조회
 * - 최종적으로 오래된 → 최신 순서로 반환하여 UI 일관성 유지
 *
 * 로직 설명:
 * 1. DB에서 lastMessageId보다 작은 id의 메시지를 최신순(DESC)으로 가져옴
 * 2. 최신순으로 가져온 배열을 reverse() → 오래된순으로 변경
 *    (UI는 오래된 → 최신 순서를 가정하기 때문)
 * 3. limit 개수만큼 메시지 반환
 * 4. 실패 시 success=false와 오류 메시지 반환
 */
export async function getMoreMessages(
  chatRoomId: string,
  lastMessageId: number,
  limit = 20
): Promise<{ success: boolean; data?: ChatMessage[]; error?: string }> {
  try {
    const olderMessages = await db.productMessage.findMany({
      where: {
        productChatRoomId: chatRoomId,
        id: { lt: lastMessageId }, // lt 연산으로 이전 메시지 로드
      },
      orderBy: { created_at: "desc" }, // 최신순(DESC)으로 가져오기
      take: limit, // limit 개수만큼 페이징
      include: { user: true },
    });

    return {
      success: true,
      data: olderMessages.reverse(), // reverse로 오래된순으로 반환
    };
  } catch (err: any) {
    console.error("getMoreMessages error:", err);
    return {
      success: false,
      error: err.message ?? "메시지 로드 중 오류 발생",
    };
  }
}
