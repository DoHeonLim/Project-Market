/**
File Name : app/(tabs)/chat/page
Description : 채팅 페이지
Author : 임도헌

History
Date        Author   Status    Description
2024.10.14  임도헌   Created
2024.10.14  임도헌   Modified  채팅 페이지 추가
2024.11.15  임도헌   Modified  채팅방 캐싱 추가
2024.12.05  임도헌   Modified  스타일 변경
*/

import getSession from "@/lib/session";
import { getChatRooms } from "./actions";
import { unstable_cache as nextCache } from "next/cache";

import ChatRoomList from "@/components/chat-room-list";

export default async function Chat() {
  const session = await getSession();

  const getCachedChatRooms = nextCache(getChatRooms, ["chatroom-list"], {
    tags: ["chatroom-list"],
  });
  const chatRooms = await getCachedChatRooms(session.id!);

  return (
    <div className="flex flex-col items-center justify-start gap-3 py-4">
      {chatRooms.map((room) => (
        <ChatRoomList key={room.id} userId={session.id!} room={room} />
      ))}
    </div>
  );
}
