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
2025.07.16  임도헌   Modified  실시간 처리 로직 훅으로 분리
2025.07.24  임도헌   Modified  리스트형 UI 리팩토링 및 스타일 개선
*/

"use client";

import { ChatRoom } from "@/types/chat";
import useChatRoomSubscription from "@/hooks/useChatRoomSubscription";
import ChatRoomCard from "./ChatRoomCard";

export default function ChatRoomListContainer({
  initialRooms,
  userId,
}: {
  initialRooms: ChatRoom[];
  userId: number;
}) {
  const { rooms, unreadCounts } = useChatRoomSubscription(userId, initialRooms);

  return (
    <div className="flex flex-col gap-3 px-4 py-6 w-full max-w-2xl mx-auto">
      <h2 className="text-lg m-1 sm:text-xl font-semibold text-foreground dark:text-text-dark mb-2">
        신호
      </h2>
      {rooms.length > 0 ? (
        rooms.map((room) => (
          <ChatRoomCard
            key={room.id}
            room={room}
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
