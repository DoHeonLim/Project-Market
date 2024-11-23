/**
File Name : app/chats/actions
Description : 제품 채팅 서버 코드
Author : 임도헌

History
Date        Author   Status    Description
2024.11.09  임도헌   Created
2024.11.09  임도헌   Modified  채팅 메시지 저장 추가
2024.11.21  임도헌   Modified  Chatroom을 productChatRoom으로 변경
*/

"use server";

import db from "@/lib/db";
import getSession from "@/lib/session";
import { Prisma } from "@prisma/client";
import { revalidateTag } from "next/cache";

export type InitialChatMessages = Prisma.PromiseReturnType<typeof getMessages>;

// 채팅방 찾고 해당 유저들인지 체크
export const getRoom = async (id: string) => {
  const room = await db.productChatRoom.findUnique({
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
export const getMessages = async (productChatRoomId: string) => {
  const messages = await db.message.findMany({
    where: {
      productChatRoomId,
    },
    select: {
      id: true,
      payload: true,
      created_at: true,
      userId: true,
      isRead: true,
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

// 채팅방의 유저 정보
export const getUserProfile = async () => {
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

export const saveMessage = async (
  payload: string,
  productChatRoomId: string
) => {
  const session = await getSession();
  await db.message.create({
    data: {
      payload,
      productChatRoomId,
      userId: session.id!,
    },
    select: { id: true },
  });
  revalidateTag("chatroom-list");
};

export const readMessageUpdate = async (
  productChatRoomId: string,
  userId: number
) => {
  const updateMessage = await db.message.updateMany({
    where: {
      productChatRoomId,
      isRead: false,
      // 내가 보낸 메시지는 업데이트 하지 않는다. 내가 아닌 유저가 보낸 메시지 일 경우에만 업데이트한다.
      NOT: {
        userId,
      },
    },
    data: {
      isRead: true,
    },
  });
  revalidateTag("chatroom-list");
  return updateMessage;
};
