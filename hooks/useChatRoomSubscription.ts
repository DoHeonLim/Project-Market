/**
 * File Name : hooks/useChatRoomSubscription
 * Description : Supabase 채팅방 실시간 구독 훅
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2025.07.16  임도헌   Created   실시간 처리 로직 훅으로 분리
 * 2025.07.16  임도헌   Modified  Supabase 채팅방 실시간 구독 로직 분리
 * 2025.07.22  임도헌   Modified  단계별 주석 추가 및 코드 흐름 설명 강화
 */

"use client";

import { useEffect, useState } from "react";
import { ChatMessage, ChatRoom } from "@/types/chat";
import { subscribeToRoomUpdates } from "@/lib/chat/room/subscribeToRoomUpdates";
import { getUnreadCount } from "@/lib/chat/messages/getUnreadCount";

/**
 * useChatRoomSubscription
 * - 각 채팅방에 대해 unread 메시지 개수를 불러오고 상태로 관리
 * - Supabase 실시간 채널을 통해 각 채팅방의 메시지/읽음 이벤트를 구독
 * - 새로운 메시지가 오면 해당 채팅방의 마지막 메시지를 갱신하고 unread count 증가
 * - 메시지가 읽혔다는 이벤트가 오면 해당 방의 unread count를 0으로 초기화
 *
 * userId - 현재 로그인된 사용자 ID
 * initialRooms - 초기 채팅방 목록
 * rooms - 최신 메시지가 반영된 채팅방 배열, unreadCounts: 각 채팅방별 안읽은 메시지 수
 */
export default function useChatRoomSubscription(
  userId: number,
  initialRooms: ChatRoom[]
) {
  const [rooms, setRooms] = useState<ChatRoom[]>(initialRooms);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});

  /**
   * 1단계: 각 채팅방에 대해 unread 메시지 개수 비동기 로딩
   */
  useEffect(() => {
    const fetchUnreadCounts = async () => {
      const counts: Record<string, number> = {};

      await Promise.all(
        initialRooms.map(async (room) => {
          counts[room.id] = await getUnreadCount(userId, room.id);
        })
      );

      setUnreadCounts(counts);
    };

    fetchUnreadCounts();
  }, [initialRooms, userId]);

  /**
   * 2단계: Supabase 실시간 채널 구독 설정
   * - 메시지 수신 시: 해당 채팅방의 마지막 메시지를 갱신하고 unread count 증가
   * - 읽음 수신 시: 해당 채팅방의 unread count를 0으로 초기화
   */
  useEffect(() => {
    const unsubscribe = subscribeToRoomUpdates({
      userId,
      roomIds: initialRooms.map((room) => room.id),

      /**
       * 메시지 수신 시 콜백
       */
      onMessage: (message: ChatMessage) => {
        // lastMessage 갱신
        setRooms((prevRooms) =>
          prevRooms.map((room) =>
            room.id === message.productChatRoomId
              ? { ...room, lastMessage: message }
              : room
          )
        );

        // unread count 증가
        setUnreadCounts((prev) => ({
          ...prev,
          [message.productChatRoomId!]:
            (prev[message.productChatRoomId!] || 0) + 1,
        }));
      },

      /**
       * 메시지 읽음 수신 시 콜백
       */
      onMessageRead: ({ roomId }) => {
        setUnreadCounts((prev) => ({
          ...prev,
          [roomId]: 0,
        }));
      },
    });

    // 언마운트 시 구독 해제
    return () => unsubscribe();
  }, [initialRooms, userId]);

  return {
    rooms, // lastMessage가 최신화된 채팅방 목록
    unreadCounts, // 채팅방별 안읽은 메시지 수
  };
}
