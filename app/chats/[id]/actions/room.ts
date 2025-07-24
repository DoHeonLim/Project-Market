/**
 * File Name : app/chats/[id]/actions/room
 * Description : 채팅방 관련 서버 액션
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2025.07.21  임도헌   Created   app/chats/[id]/actions.ts 파일을 기능별로 분리
 */
"use server";

import { checkChatRoomAccess } from "@/lib/chat/room/checkChatRoomAccess";
import { getChatRoomDetails } from "@/lib/chat/room/getChatRoomDetails";

/**
 * 채팅방 접근 권한 server action
 */
export const checkChatRoomAccessAction = async (
  chatRoomId: string,
  userId: number
) => {
  return await checkChatRoomAccess(chatRoomId, userId);
};

/**
 * 채팅방 제품 상세 정보 조회 server action
 */
export const getChatRoomDetailsAction = async (productId: number) => {
  return await getChatRoomDetails(productId);
};
