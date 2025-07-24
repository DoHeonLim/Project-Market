/**
 * File Name : hooks/useChatSubscription
 * Description : Supabase 실시간 채팅 구독 훅
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2025.07.16  임도헌   Created   Supabase 실시간 채팅 구독 훅 분리
 * 2025.07.22  임도헌   Modified  단계별 주석 추가 및 코드 흐름 설명 강화
 */

"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { ChatMessage } from "@/types/chat";

/**
 * useChatSubscription
 * - Supabase 실시간 채널을 통해 특정 채팅방의 "message" 이벤트를 구독
 * - 메시지 수신 시, 현재 사용자가 보낸 메시지가 아니면 콜백(onNewMessage)을 통해 전달
 * - 컴포넌트 언마운트 시 채널 해제
 *
 * chatRoomId - 채팅방 고유 ID (Supabase 채널 구독 식별자)
 * onNewMessage - 수신한 메시지를 상위 컴포넌트에 전달하는 콜백
 * currentUserId - 현재 로그인한 사용자 ID (자기 메시지 필터링용)
 */
export default function useChatSubscription(
  chatRoomId: string,
  onNewMessage: (message: ChatMessage) => void,
  currentUserId: number
) {
  useEffect(() => {
    /**
     * 1단계: Supabase 채널 생성 및 "message" 이벤트 리스너 등록
     */
    const channel = supabase
      .channel(`room-${chatRoomId}`)
      .on("broadcast", { event: "message" }, ({ payload }) => {
        // 1-1. 현재 사용자가 보낸 메시지면 무시 (중복 표시 방지)
        if (payload.user?.id === currentUserId) {
          console.log("🧍 내 메시지 수신 무시:", payload);
          return;
        }

        // 1-2. 수신 메시지를 ChatMessage 타입으로 변환
        const newMessage: ChatMessage = {
          id: payload.id,
          payload: payload.payload,
          created_at: new Date(payload.created_at),
          isRead: payload.isRead ?? false,
          productChatRoomId: payload.productChatRoomId,
          user: {
            id: payload.user.id,
            username: payload.user.username,
            avatar: payload.user.avatar ?? null,
          },
        };

        // 1-3. 콜백을 통해 상위 컴포넌트로 전달
        onNewMessage(newMessage);
      })
      .subscribe();

    /**
     * 2단계: 언마운트 시 Supabase 채널 구독 해제
     */
    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatRoomId, onNewMessage, currentUserId]);
}
