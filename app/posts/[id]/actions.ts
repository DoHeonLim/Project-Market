/**
 File Name : app/posts/[id]/action
 Description : 게시판 페이지
 Author : 임도헌
 
 History
 Date        Author   Status    Description
 2024.10.17  임도헌   Created
 2024.10.17  임도헌   Modified  좋아요, 싫어요 기능 추가
 2024.11.05  임도헌   Modified  댓글 생성 기능 추가
 2024.11.06  임도헌   Modified  댓글 삭제 기능 추가
 2024.12.12  임도헌   Modified  like모델을 postLike로 변경
 */
"use server";

import { DeleteResponse } from "@/components/comment-delete-button";
import db from "@/lib/db";
import getSession from "@/lib/session";
import { revalidateTag } from "next/cache";
import { z } from "zod";

// 좋아요
export const likePost = async (postId: number) => {
  try {
    const session = await getSession();
    await db.postLike.create({
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
  try {
    const session = await getSession();
    await db.postLike.delete({
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

// 댓글 스키마
const commentSchema = z.object({
  payload: z
    .string({
      required_error: "댓글은 필수입니다.",
    })
    .min(5),
  postId: z.coerce.number(),
});

// 댓글 생성
export const createComment = async (_: any, FormData: FormData) => {
  const data = {
    payload: FormData.get("payload"),
    postId: FormData.get("postId"),
  };
  const session = await getSession();
  const results = commentSchema.safeParse(data);
  if (!results.success) {
    return results.error.flatten();
  } else {
    await db.comment.create({
      data: {
        payload: results.data.payload,
        postId: results.data.postId,
        userId: session.id!,
      },
    });
    revalidateTag(`comments-${results.data.postId}`);
  }
};

// 댓글 삭제
export const deleteComment = async (
  id: number,
  postId: number
): Promise<DeleteResponse> => {
  try {
    await db.comment.delete({
      where: {
        id,
      },
    });
    revalidateTag(`comments-${postId}`);
    return { success: true };
  } catch (e) {
    console.error(e);
    return { success: false, error: "댓글 삭제 중 오류가 발생했습니다." };
  }
};
