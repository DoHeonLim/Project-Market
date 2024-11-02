/**
 File Name : app/posts/[id]/action
 Description : 게시판 페이지
 Author : 임도헌
 
 History
 Date        Author   Status    Description
 2024.10.17  임도헌   Created
 2024.10.17  임도헌   Modified  게시판 페이지
 */
"use server";

import db from "@/lib/db";
import getSession from "@/lib/session";
import { revalidateTag } from "next/cache";

// 좋아요
export const likePost = async (postId: number) => {
  await new Promise((r) => setTimeout(r, 5000));
  try {
    const session = await getSession();
    await db.like.create({
      data: {
        postId,
        userId: session.id!,
      },
    });
    revalidateTag(`like-status-${postId}`);
  } catch (e) {
    console.log(e);
  }
};
// 싫어요
export const dislikePost = async (postId: number) => {
  await new Promise((r) => setTimeout(r, 5000));
  try {
    const session = await getSession();
    await db.like.delete({
      where: {
        id: {
          postId,
          userId: session.id!,
        },
      },
    });
    revalidateTag(`like-status-${postId}`);
  } catch (e) {
    console.log(e);
  }
};
