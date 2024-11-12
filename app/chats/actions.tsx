/**
File Name : app/chats/actions
Description : 제품 채팅 서버 코드
Author : 임도헌

History
Date        Author   Status    Description
2024.11.09  임도헌   Created
2024.11.09  임도헌   Modified  채팅 메시지 저장 추가
*/

"use server";

import db from "@/lib/db";
import getSession from "@/lib/session";

export const saveMessage = async (payload: string, chatRoomId: string) => {
  const session = await getSession();
  await db.message.create({
    data: {
      payload,
      chatRoomId,
      userId: session.id!,
    },
    select: { id: true },
  });
};
