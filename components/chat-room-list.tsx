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
        bg-white/80 dark:bg-background-dark/80 
        hover:bg-white dark:hover:bg-background-dark
        hover:scale-[1.02] hover:shadow-xl
        border-2 border-neutral-200/50 dark:border-primary-dark/50
        hover:border-primary/50 dark:hover:border-primary-light/50
        p-4 rounded-lg"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-4">
        <div className="flex items-center gap-4">
          <div
            className="relative size-14 flex-shrink-0 rounded-lg overflow-hidden
            ring-2 ring-neutral-200/50 dark:ring-primary-dark/50
            group-hover:ring-primary/50 dark:group-hover:ring-primary-light/50
            group-hover:shadow-lg
            transition-all duration-300"
          >
            <Image
              src={`${initialRoom.product.images[0]?.url}/avatar`}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-110"
              alt={initialRoom.product.title}
            />
          </div>
          <div className="flex flex-col gap-2 min-w-0">
            <div className="flex items-center gap-2">
              <UserAvatar
                avatar={initialRoom.users[0].avatar}
                username={initialRoom.users[0].username}
                size="md"
                disabled={true}
              />
            </div>
          </div>
        </div>
        <p
          className="text-neutral-600 dark:text-neutral-400 line-clamp-2 sm:line-clamp-1 pl-16 sm:pl-0
          group-hover:text-primary dark:group-hover:text-primary-light 
          transition-colors duration-300"
        >
          {initialRoom.messages[0]?.payload ?? "새로운 대화를 시작해보세요"}
        </p>
        <div className="flex sm:flex-col items-center sm:items-end gap-2 ml-auto">
          <TimeAgo date={initialRoom.messages[0]?.created_at.toString()} />
          {unreadCount > 0 && (
            <div
              className="flex items-center justify-center size-5 
              bg-rose-500 dark:bg-rose-600
              group-hover:bg-rose-600 dark:group-hover:bg-rose-500
              group-hover:scale-110 group-hover:shadow-lg
              transition-all duration-300 rounded-full"
            >
              <span className="text-white text-xs">{unreadCount}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
