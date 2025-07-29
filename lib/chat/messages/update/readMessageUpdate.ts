/**
 * File Name : lib/chat/messages/update/readMessageUpdate
 * Description : 채팅 메시지 읽음 처리 로직
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2025.07.13  임도헌   Created   메시지 읽음 처리 로직 분리
 * 2025.07.29  임도헌   Modified  읽은 메시지 ID 목록 반환
 */

import db from "@/lib/db";

/**
 * readMessageUpdate
 * - 지정된 채팅방에서 "본인이 아닌 사용자가 보낸 안 읽은 메시지"를 읽음 처리
 * - 읽음 처리된 메시지의 ID 목록을 반환
 *
 * chatRoomId - 채팅방 ID
 * userId - 현재 사용자 ID
 * @returns number[] - 읽음 처리된 메시지 ID 배열
 */
export const readMessageUpdate = async (
  chatRoomId: string,
  userId: number
): Promise<number[]> => {
  /**
   * 1단계: 안 읽은 메시지 조회
   * - 조건: 현재 채팅방, isRead=false, 내가 보낸 메시지는 제외
   */
  const unreadMessages = await db.productMessage.findMany({
    where: {
      productChatRoomId: chatRoomId,
      isRead: false,
      NOT: { userId },
    },
    select: {
      id: true,
    },
  });

  // 읽을 메시지가 없으면 빈 배열 반환
  if (unreadMessages.length === 0) return [];

  /**
   * 2단계: 읽음 처리할 메시지 ID 추출
   */
  const ids = unreadMessages.map((m) => m.id);

  /**
   * 3단계: 해당 메시지들을 읽음 처리로 업데이트
   */
  await db.productMessage.updateMany({
    where: { id: { in: ids } },
    data: { isRead: true },
  });

  /**
   * 4단계: 읽음 처리된 메시지 ID 목록 반환
   */
  return ids;
};
