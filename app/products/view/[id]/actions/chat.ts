/**
File Name : app/products/view/[id]/actions/chat
Description : 제품 채팅방 생성 서버 액션
Author : 임도헌

History
Date        Author   Status    Description
2024.12.12  임도헌   Created   채팅방 생성 함수 구현
2025.06.08  임도헌   Modified  actions 파일 역할별 분리 완료
*/
"use server";

import db from "@/lib/db";
import getSession from "@/lib/session";
import { revalidateTag } from "next/cache";
import { redirect } from "next/navigation";

/**
 * 제품에 대한 채팅방 생성 함수
 * @param productId 제품 ID
 * @returns 생성된 채팅방으로 리다이렉트
 */
export const createChatRoom = async (productId: number) => {
  const session = await getSession();
  if (!session?.id) throw new Error("로그인이 필요합니다.");

  const product = await db.product.findUnique({
    where: { id: productId },
    select: {
      userId: true,
    },
  });

  if (!product) {
    throw new Error("존재하지 않는 제품입니다.");
  }

  const existingRoom = await db.productChatRoom.findFirst({
    where: {
      productId,
      users: {
        every: {
          id: {
            in: [product.userId, session.id],
          },
        },
      },
    },
    select: { id: true },
  });

  if (existingRoom) {
    revalidateTag("chat-list");
    return redirect(`/chats/${existingRoom.id}`);
  }

  const room = await db.productChatRoom.create({
    data: {
      users: {
        connect: [{ id: product.userId }, { id: session.id }],
      },
      product: {
        connect: { id: productId },
      },
    },
    select: { id: true },
  });

  revalidateTag("chat-list");
  return redirect(`/chats/${room.id}`);
};
