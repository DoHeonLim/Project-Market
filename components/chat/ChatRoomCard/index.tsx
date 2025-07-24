/**
 * File Name : components/chat/chatRoomCard/index
 * Description : 채팅방 카드 메인 컴포넌트
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2024.11.15  임도헌   Created
 * 2024.11.15  임도헌   Modified  채팅방 리스트 컴포넌트 추가
 * 2024.11.21  임도헌   Modified  ChatroomId를 productChatRoomId으로 변경
 * 2024.12.07  임도헌   Modified  채팅방 리스트 스타일 변경
 * 2024.12.07  임도헌   Modified  프로필 이미지 컴포넌트 분리
 * 2024.12.12  임도헌   Modified  채팅방 생성 시간 표시 변경
 * 2024.12.22  임도헌   Modified  채팅방 안 읽은 메시지 실시간 갱신
 * 2024.12.23  임도헌   Modified  채팅방 갱신 코드 chat-room-list-container.tsx로 이동
 * 2025.05.10  임도헌   Modified  UI 개선
 * 2025.07.15  임도헌   Modified  ChatRoomList컴포넌트에서 채팅방 카드 컴포넌트로 변경
 * 2025.07.16  임도헌   Modified  기능별 컴포넌트 분리
 * 2025.07.24  임도헌   Modified  BoardPort 스타일 완전 적용
 */

"use client";

import Link from "next/link";
import ChatRoomThumbnail from "./ChatRoomThumbnail";
import ChatRoomHeader from "./ChatRoomHeader";
import ChatRoomLastMessage from "./ChatRoomLastMessage";
import ChatRoomUnreadBadge from "./ChatRoomUnreadBadge";
import { ChatRoom } from "@/types/chat";

interface ChatRoomCardProps {
  room: ChatRoom;
  unreadCount: number;
}

export default function ChatRoomCard({ room, unreadCount }: ChatRoomCardProps) {
  return (
    <Link
      href={`/chats/${room.id}`}
      className={`
        group w-full flex items-center gap-4 px-4 py-3
        rounded-xl bg-white dark:bg-neutral-800
        border border-neutral-200 dark:border-neutral-900
        shadow-md hover:shadow-lg
        hover:bg-neutral-100 dark:hover:bg-neutral-900
      `}
    >
      {/* 썸네일 */}
      <ChatRoomThumbnail product={room.product} />

      {/* 유저 + 메시지 */}
      <div className="flex-1 min-w-0 flex flex-col gap-0.5">
        <ChatRoomHeader user={room.users[0]} />
        <ChatRoomLastMessage message={room.lastMessage ?? undefined} />
      </div>

      {/* 안읽은 뱃지 */}
      <ChatRoomUnreadBadge
        count={unreadCount}
        date={room.lastMessage?.created_at?.toString() ?? ""}
      />
    </Link>
  );
}
