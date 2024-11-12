/**
File Name : app/chats/[id]/page
Description : 제품 채팅 페이지
Author : 임도헌

History
Date        Author   Status    Description
2024.11.08  임도헌   Created
2024.11.08  임도헌   Modified  제품 채팅 페이지 추가
*/

// 해야될 것 만약 이미 해당 유저 두명이 존재하는 채팅방이 있다면 새로 방을 생성하지 않고
// 기존 방으로 연결되게 변경해야 됨

import ChatMessagesList from "@/components/chat-messages-list";
import db from "@/lib/db";
import getSession from "@/lib/session";
import { Prisma } from "@prisma/client";
import { notFound } from "next/navigation";

// 채팅방 찾고 해당 유저들인지 체크
const getRoom = async (id: string) => {
  const room = await db.chatRoom.findUnique({
    where: {
      id,
    },
    include: {
      users: {
        select: { id: true },
      },
    },
  });
  if (room) {
    const session = await getSession();
    const canSee = Boolean(room.users.find((user) => user.id === session.id!));
    if (!canSee) {
      return null;
    }
  }
  return room;
};

// 채팅방의 모든 메시지를 가져오는 함수
const getMessages = async (chatRoomId: string) => {
  const messages = await db.message.findMany({
    where: {
      chatRoomId,
    },
    select: {
      id: true,
      payload: true,
      created_at: true,
      userId: true,
      user: {
        select: {
          avatar: true,
          username: true,
        },
      },
    },
  });
  return messages;
};

const getUserProfile = async () => {
  const session = await getSession();
  const user = await db.user.findUnique({
    where: {
      id: session.id!,
    },
    select: {
      username: true,
      avatar: true,
    },
  });
  return user;
};

export type InitialChatMessages = Prisma.PromiseReturnType<typeof getMessages>;

export default async function ChatRoom({ params }: { params: { id: string } }) {
  const chatRoomId = params.id;
  const room = await getRoom(chatRoomId);
  if (!room) {
    return notFound();
  }
  const initialMessages = await getMessages(chatRoomId);
  const session = await getSession();
  const user = await getUserProfile();
  if (!user) {
    return notFound();
  }
  return (
    <ChatMessagesList
      chatRoomId={chatRoomId}
      userId={session.id!}
      username={user.username}
      avatar={user.avatar!}
      initialMessages={initialMessages}
    />
  );
}
