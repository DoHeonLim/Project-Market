/**
 * File Name : lib/chat/messages/update/readMessageUpdate
 * Description : 채팅 메시지 읽음 처리 로직
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2025.07.13  임도헌   Created   메시지 읽음 처리 로직 분리
 */
import db from "@/lib/db";

/**
 * readMessageUpdate
 * - 채팅방 내 안 읽은 메시지를 읽음 처리함
 * - 본인이 보낸 메시지는 제외
 *
 * chatRoomId - 채팅방 ID
 * userId - 현재 사용자 ID
 * @returns 업데이트된 메시지 개수 등의 메타 정보
 */
export const readMessageUpdate = async (chatRoomId: string, userId: number) => {
  const updated = await db.productMessage.updateMany({
    where: {
      productChatRoomId: chatRoomId,
      isRead: false,
      NOT: { userId }, // 내가 보낸 메시지는 제외
    },
    data: { isRead: true },
  });

  return updated;
};
