/**
 * File Name : hooks/useChatSubscription
 * Description : Supabase 실시간 채팅 구독 훅
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2025.07.16  임도헌   Created   Supabase 실시간 채팅 구독 훅 분리
 * 2025.07.22  임도헌   Modified  단계별 주석 추가 및 코드 흐름 설명 강화
 * 2025.07.29  임도헌   Modified  읽음 처리 이벤트(message_read) 수신 로직 추가
 */

"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { ChatMessage } from "@/types/chat";
import { readMessageUpdateAction } from "@/app/chats/[id]/actions/messages";

interface UseChatSubscriptionOptions {
  chatRoomId: string; // Supabase 채널 식별용 채팅방 ID
  currentUserId: number; // 현재 로그인한 유저 ID
  onNewMessage: (message: ChatMessage) => void; // 메시지 수신 시 호출되는 콜백
  onMessagesRead: (readIds: number[]) => void; // 읽음 처리 시 호출되는 콜백
}

/**
 * useChatSubscription
 * - Supabase를 통한 실시간 메시지 수신 및 읽음 처리 이벤트를 구독
 * - 상대방 메시지 수신 시 읽음 처리 API 호출
 * - 읽음 처리 결과를 다시 브로드캐스트로 수신하면 메시지 목록 상태 갱신
 */
export default function useChatSubscription({
  chatRoomId,
  currentUserId,
  onNewMessage,
  onMessagesRead,
}: UseChatSubscriptionOptions) {
  useEffect(() => {
    /**
     * 1단계: Supabase 채널 생성 및 구독
     */
    const channel = supabase
      .channel(`room-${chatRoomId}`)

      /**
       * 2단계: 메시지 수신 브로드캐스트 핸들링
       * - 실시간으로 전송된 메시지를 수신
       * - 메시지 구조를 ChatMessage 타입으로 변환하여 콜백 전달
       * - 상대방 메시지일 경우 읽음 처리 API 호출
       */
      .on("broadcast", { event: "message" }, async ({ payload }) => {
        const newMessage: ChatMessage = {
          id: payload.id,
          payload: payload.payload,
          created_at: new Date(payload.created_at),
          isRead: false, // 수신 시에는 읽지 않은 상태
          productChatRoomId: payload.productChatRoomId,
          user: {
            id: payload.user.id,
            username: payload.user.username,
            avatar: payload.user.avatar ?? null,
          },
        };

        const isOwnMessage = payload.user?.id === currentUserId;

        // 메시지를 상위 컴포넌트로 전달
        onNewMessage(newMessage);

        // 내가 보낸 메시지가 아니면 읽음 처리 요청
        if (!isOwnMessage) {
          await readMessageUpdateAction(chatRoomId, currentUserId);
        }
      })

      /**
       * 3단계: 읽음 처리 브로드캐스트 수신
       * - 다른 사용자가 메시지를 읽었을 때 전송되는 read 이벤트 수신
       * - readIds 배열을 상위 콜백으로 전달하여 메시지 상태를 갱신
       */
      .on("broadcast", { event: "message_read" }, ({ payload }) => {
        const readIds: number[] = payload.readIds;
        if (Array.isArray(readIds) && readIds.length > 0) {
          onMessagesRead(readIds);
        }
      })

      /**
       * 4단계: 채널 구독 시작
       */
      .subscribe();

    /**
     * 5단계: 컴포넌트 언마운트 시 채널 구독 해제
     */
    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatRoomId, currentUserId, onNewMessage, onMessagesRead]);
}
