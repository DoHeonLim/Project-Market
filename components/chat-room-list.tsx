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
 */

import { UnreadMessageCount } from "@/app/(tabs)/chat/actions";
import { formatToTimeAgo } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import UserAvatar from "./user-avatar";

interface IListChatProps {
  userId: number;
  room: {
    id: string;
    created_at: Date;
    updated_at: Date;
    productId: number;
    users: {
      username: string;
      avatar: string | null;
    }[];
    messages: {
      id: number;
      created_at: Date;
      payload: string;
    }[];
    product: {
      title: string;
      photo: string;
    };
  };
}

export default function ChatRoomList({ userId, room }: IListChatProps) {
  return (
    <>
      <Link
        key={room.id}
        href={`/chats/${room.id}`}
        className="w-full px-10 py-4 transition-colors border-2 cursor-pointer hover:bg-opacity-40 border-neutral-500 hover:bg-indigo-500 hover:border-indigo-400 rounded-xl"
      >
        <div className="flex items-center justify-center w-full rounded-xl">
          <div className="flex justify-between w-full rounded-xl">
            <div className="flex items-center justify-center gap-4">
              <div className="relative size-14">
                <Image
                  src={`${room.product.photo}/avatar`}
                  fill
                  className="object-cover"
                  alt={room.product.title}
                />
              </div>
              <div className="flex flex-col gap-1">
                <UserAvatar
                  avatar={room.users[0].avatar}
                  username={room.users[0].username}
                  size="md"
                  disabled={true}
                />
                <div>
                  <span className="text-neutral-400 text-md">
                    {room.messages[0].payload ?? null}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center gap-3">
              <UnreadMessageCount id={userId} productChatRoomId={room.id} />
              <span className="text-white">
                {formatToTimeAgo(room.messages[0]?.created_at.toString())}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </>
  );
}
