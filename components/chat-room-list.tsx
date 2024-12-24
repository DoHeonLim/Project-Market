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
      className="w-full px-10 py-4 transition-colors cursor-pointer hover:bg-opacity-40 border-b border-neutral-300 dark:border-neutral-600 hover:bg-indigo-400 hover:border-indigo-500 hover:scale-[1.02] rounded-xl"
    >
      <div className="flex items-center justify-center w-full rounded-xl">
        <div className="flex justify-between w-full rounded-xl">
          <div className="flex items-center justify-center gap-4">
            <div className="relative size-14">
              <Image
                src={`${initialRoom.product.images[0]?.url}/avatar`}
                fill
                className="object-cover"
                alt={initialRoom.product.title}
              />
            </div>
            <div className="flex flex-col gap-1">
              <UserAvatar
                avatar={initialRoom.users[0].avatar}
                username={initialRoom.users[0].username}
                size="md"
                disabled={true}
              />
              <div>
                <span className="text-neutral-400 text-md">
                  {initialRoom.messages[0]?.payload ?? null}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-center gap-3">
            {unreadCount > 0 && (
              <div className="flex items-center justify-center size-5 bg-red-500 rounded-full">
                <span className="text-white text-sm">{unreadCount}</span>
              </div>
            )}
            <TimeAgo date={initialRoom.messages[0]?.created_at.toString()} />
          </div>
        </div>
      </div>
    </Link>
  );
}
