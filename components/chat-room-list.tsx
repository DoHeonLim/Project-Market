/**
 File Name : components/chat-room-list
 Description : 채팅방 리스트 컴포넌트
 Author : 임도헌
 
 History
 Date        Author   Status    Description
 2024.11.15  임도헌   Created
 2024.11.15  임도헌   Modified  채팅방 리스트 컴포넌트
 */

import { UnreadMessageCount } from "@/app/(tabs)/chat/actions";
import { formatToTimeAgo } from "@/lib/utils";
import { UserIcon } from "@heroicons/react/24/solid";
import Image from "next/image";
import Link from "next/link";

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
          <div className="flex justify-between w-full shadow-xl rounded-xl">
            <div className="flex items-center justify-center gap-4">
              <div>
                <Image
                  src={`${room.product.photo}/avatar`}
                  width={50}
                  height={50}
                  alt={room.product.title}
                />
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex gap-2 *:text-white">
                  {room.users[0].avatar !== null ? (
                    <Image
                      width={40}
                      height={40}
                      className="rounded-md size-7"
                      src={room.users[0].avatar}
                      alt={room.users[0].username}
                    />
                  ) : (
                    <UserIcon className="rounded-md size-7" />
                  )}
                  <span className="text-xl">{room.users[0].username}</span>
                </div>
                <div>
                  <span className="text-neutral-400 text-md">
                    {room.messages[0].payload ?? null}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center gap-3">
              <UnreadMessageCount id={userId} chatRoomId={room.id} />
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
