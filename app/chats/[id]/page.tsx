/**
File Name : app/chats/[id]/page
Description : 제품 채팅 페이지
Author : 임도헌

History
Date        Author   Status    Description
2024.11.08  임도헌   Created
2024.11.08  임도헌   Modified  제품 채팅 페이지 추가
2024.11.15  임도헌   Modified  prisma 코드 actions으로 옮김
2024.11.21  임도헌   Modified  Chatroom을 productChatRoom으로 변경
*/

// 해야될 것 만약 이미 해당 유저 두명이 존재하는 채팅방이 있다면 새로 방을 생성하지 않고
// 기존 방으로 연결되게 변경해야 됨

import ChatMessagesList from "@/components/chat-messages-list";
import getSession from "@/lib/session";
import { notFound } from "next/navigation";
import {
  getMessages,
  getRoom,
  getUserProfile,
  readMessageUpdate,
} from "./actions";

export default async function ChatRoom({ params }: { params: { id: string } }) {
  const chatRoomId = params.id;
  // 현재 채팅방 정보
  const room = await getRoom(chatRoomId);
  if (!room) {
    return notFound();
  }
  // 메세지 초깃값
  const initialMessages = await getMessages(chatRoomId);
  const session = await getSession();
  // 유저 정보
  const user = await getUserProfile();
  if (!user) {
    return notFound();
  }

  // 채팅 방에 들어가면 메시지 읽음 표시로 업데이트
  await readMessageUpdate(chatRoomId, session.id!);

  return (
    <ChatMessagesList
      productChatRoomId={chatRoomId}
      userId={session.id!}
      username={user.username}
      avatar={user.avatar!}
      initialMessages={initialMessages}
    />
  );
}
