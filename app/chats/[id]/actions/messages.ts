/**
 * File Name : app/chats/[id]/actions/messages
 * Description : 채팅 메시지 관련 서버 액션
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2024.11.09  임도헌   Created
 * 2024.11.09  임도헌   Modified  채팅 메시지 저장 추가
 * 2024.11.21  임도헌   Modified  Chatroom을 productChatRoom으로 변경
 * 2024.12.12  임도헌   Modified  message모델을 productMessage로 변경
 * 2024.12.22  임도헌   Modified  채팅 메시지 웹 푸시 기능 추가
 * 2024.12.26  임도헌   Modified  채팅방 제품 정보 추가
 * 2025.01.12  임도헌   Modified  푸시 알림 시 채팅 유저 이미지 추가
 * 2025.04.18  임도헌   Modified  checkQuickResponseBadge함수를 서버 액션으로 처리
 * 2025.05.23  임도헌   Modified  카테고리 필드명 변경(name->kor_name)
 * 2025.05.26  임도헌   Modified  .tsx -> .ts로 변경
 * 2025.07.13  임도헌   Modified  비즈니스 로직과 server action 분리
 * 2025.07.21  임도헌   Modified  app/chats/[id]/actions.ts 파일을 기능별로 분리
 * 2025.07.29  임도헌   Modified  readMessageUpdateAction에 실시간 읽음 처리 추가
 */
"use server";

import getSession from "@/lib/session";
import { getInitialMessages } from "@/lib/chat/messages/getInitialMessages";
import { getMoreMessages } from "@/lib/chat/messages/getMoreMessages";
import { revalidateTag } from "next/cache";
import { createMessage } from "@/lib/chat/messages/create/createMessage";
import { readMessageUpdate } from "@/lib/chat/messages/update/readMessageUpdate";
import { supabase } from "@/lib/supabase";

/**
 * 채팅 메시지 전송 server action
 */
export const sendMessageAction = async (
  chatRoomId: string,
  payload: string
) => {
  const session = await getSession();
  if (!session?.id) throw new Error("로그인이 필요합니다.");

  const result = await createMessage(payload, chatRoomId, session.id);

  if (result.success) {
    revalidateTag(`chat-messages-${chatRoomId}`);
  }

  return result;
};

/**
 * 초기 메시지 조회 server action
 */
export const getInitialMessagesAction = async (
  chatRoomId: string,
  limit = 20
) => {
  return await getInitialMessages(chatRoomId, limit);
};

/**
 * 과거 메시지 추가 로드 server action
 */
export const getMoreMessagesAction = async (
  chatRoomId: string,
  lastMessageId: number,
  limit = 20
) => {
  return await getMoreMessages(chatRoomId, lastMessageId, limit);
};

/**
 * 메시지 읽음 처리 server action
 */
export const readMessageUpdateAction = async (
  chatRoomId: string,
  userId: number
) => {
  const readIds = await readMessageUpdate(chatRoomId, userId);

  // ✅ 읽음 메시지가 있을 때만 broadcast
  if (readIds.length > 0) {
    await supabase.channel(`room-${chatRoomId}`).send({
      type: "broadcast",
      event: "message_read",
      payload: { readIds },
    });
  }

  revalidateTag("chatroom-list");

  return { success: true, readIds };
};
