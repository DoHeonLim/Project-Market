/**
File Name : components/chat/ChatRoomListContainer
Description : 채팅방 목록 컨테이너 컴포넌트
Author : 임도헌

History
Date        Author   Status    Description
2024.12.22  임도헌   Created
2024.12.22  임도헌   Modified  채팅방 목록 컨테이너 컴포넌트 추가
2024.12.22  임도헌   Modified  채팅방 목록 실시간 갱신
2024.12.23  임도헌   Modified  채팅방 목록 실시간 갱신 오류 수정
2024.12.25  임도헌   Modified  채팅방 목록 스타일 변경
*/
"use client";

import { useEffect, useState } from "react";
import { ChatRoomType, unreadMessageCountDB } from "@/app/(tabs)/chat/actions";
import ChatRoomList from "./ChatRoomList";
import { supabase } from "@/lib/supabase";

export default function ChatRoomListContainer({
  initialRooms,
  userId,
}: {
  initialRooms: ChatRoomType[];
  userId: number;
}) {
  const [rooms, setRooms] = useState(initialRooms);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});

  // 초기 읽지 않은 메시지 수 가져오기
  useEffect(() => {
    const fetchUnreadCounts = async () => {
      const counts: Record<string, number> = {};
      await Promise.all(
        initialRooms.map(async (room) => {
          counts[room.id] = await unreadMessageCountDB(userId, room.id);
        })
      );
      setUnreadCounts(counts);
    };

    fetchUnreadCounts();
  }, [initialRooms, userId]);

  // 실시간 메시지 구독
  useEffect(() => {
    const roomIds = initialRooms.map((room) => room.id);

    const channels = roomIds.map((roomId) => {
      const channel = supabase.channel(`room-${roomId}`);

      channel
        .on("broadcast", { event: "message" }, ({ payload }) => {
          if (payload.userId !== userId) {
            // 새 메시지가 오면 rooms 업데이트
            setRooms((prevRooms) => {
              const updatedRooms = prevRooms.map((r) => {
                if (r.id === payload.productChatRoomId) {
                  const newMessage = {
                    id: payload.id,
                    payload: payload.payload,
                    isRead: false,
                    created_at: new Date(payload.created_at),
                    userId: payload.userId,
                    productChatRoomId: payload.productChatRoomId,
                  };

                  return {
                    ...r,
                    messages: [newMessage, ...(r.messages || [])],
                  };
                }
                return r;
              });

              // 최신 메시지 시간순으로 정렬
              return [...updatedRooms].sort((a, b) => {
                const aCreatedAt = a.messages?.[0]?.created_at || new Date(0);
                const bCreatedAt = b.messages?.[0]?.created_at || new Date(0);
                return (
                  new Date(bCreatedAt).getTime() -
                  new Date(aCreatedAt).getTime()
                );
              });
            });

            setUnreadCounts((prev) => ({
              ...prev,
              [payload.productChatRoomId]:
                (prev[payload.productChatRoomId] || 0) + 1,
            }));
          }
        })
        .on("broadcast", { event: "message_read" }, ({ payload }) => {
          if (payload.roomId === roomId && payload.userId === userId) {
            setUnreadCounts((prev) => ({
              ...prev,
              [payload.roomId]: 0,
            }));
          }
        })
        .subscribe();

      return channel;
    });

    // 컴포넌트 언마운트 시 구독 해제
    return () => {
      channels.forEach((channel) => channel.unsubscribe());
    };
  }, [initialRooms, userId]);

  return (
    <div className="flex flex-col items-center justify-start w-full gap-3 p-4">
      {rooms.length > 0 ? (
        rooms.map((room) => (
          <ChatRoomList
            key={room.id}
            initialRoom={room}
            unreadCount={unreadCounts[room.id] || 0}
          />
        ))
      ) : (
        <div
          className="flex flex-col items-center justify-center w-full gap-4 p-8 
          bg-white/5 dark:bg-background-dark/50 
          border border-neutral-200/20 dark:border-primary-dark/30 
          rounded-lg"
        >
          <p className="text-neutral-600 dark:text-neutral-400">
            아직 진행 중인 대화가 없습니다
          </p>
        </div>
      )}
    </div>
  );
}
