/**
 File Name : components/chat-room-list
 Description : 채팅방 리스트 컴포넌트
 Author : 임도헌
 
 History
 Date        Author   Status    Description
 2024.11.15  임도헌   Created
 2024.11.15  임도헌   Modified  채팅방 리스트 컴포넌트 추가
 2024.11.21  임도헌   Modified  ChatroomId를 productChatRoomId으로 변경
 2024.12.07  임도헌   Modified  채팅방 리스트 스타일 변경
 2024.12.07  임도헌   Modified  프로필 이미지 컴포넌트 분리
 2024.12.12  임도헌   Modified  채팅방 생성 시간 표시 변경
 2024.12.22  임도헌   Modified  채팅방 안 읽은 메시지 실시간 갱신
 2024.12.23  임도헌   Modified  채팅방 갱신 코드 chat-room-list-container.tsx로 이동
  2025.05.10  임도헌   Modified  UI 개선
 */

"use client";

import Image from "next/image";
import Link from "next/link";
import UserAvatar from "./user-avatar";
import TimeAgo from "./time-ago";
import { ChatRoomType } from "@/app/(tabs)/chat/actions";

interface IListChatProps {
  initialRoom: ChatRoomType;
  unreadCount: number;
}

export default function ChatRoomList({
  initialRoom,
  unreadCount,
}: IListChatProps) {
  return (
    <Link
      href={`/chats/${initialRoom.id}`}
      className="w-full transition-all duration-300 cursor-pointer group
        bg-white dark:bg-neutral-900
        hover:bg-neutral-100 dark:hover:bg-neutral-800
        border border-neutral-200 dark:border-neutral-700
        p-4 rounded-xl flex items-center gap-4 min-h-[72px]
        shadow-sm hover:shadow-lg"
    >
      {/* 썸네일 */}
      <div className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-neutral-100 dark:bg-neutral-800">
        <Image
          src={`${initialRoom.product.images[0].url}/avatar`}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-110"
          alt={initialRoom.product.title}
        />
      </div>
      {/* 본문 정보 */}
      <div className="flex-1 min-w-0 flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <UserAvatar
            avatar={initialRoom.users[0].avatar}
            username={initialRoom.users[0].username}
            size="md"
            showUsername={true}
            disabled={true}
          />
        </div>
        <div className="text-sm text-neutral-500 dark:text-neutral-400 truncate">
          {initialRoom.messages[0]?.payload ?? "새로운 대화를 시작해보세요"}
        </div>
      </div>
      {/* 우측 정보 */}
      <div className="flex flex-col items-end gap-2 ml-2 min-w-[56px]">
        <span className="text-xs text-neutral-400 dark:text-neutral-500 whitespace-nowrap">
          <TimeAgo date={initialRoom.messages[0]?.created_at?.toString()} />
        </span>
        {unreadCount > 0 && (
          <span className="bg-rose-500 dark:bg-rose-600 text-white text-xs font-bold rounded-full px-2 py-0.5 shadow-md">
            {unreadCount}
          </span>
        )}
      </div>
    </Link>
  );
}
