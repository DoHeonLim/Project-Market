/**
 * File Name : app/posts/[id]/actions/comments
 * Description : 게시글 댓글 관련 서버 액션
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2025.07.06  임도헌   Created   댓글 관련 서버 액션 분리
 * 2025.07.11  임도헌   Modified  댓글 무한 스크롤 구현
 */
"use server";

import db from "@/lib/db";
import getSession from "@/lib/session";
import {
  badgeChecks,
  checkBoardExplorerBadge,
} from "@/lib/check-badge-conditions";
import { revalidateTag, unstable_cache as nextCache } from "next/cache";
import { commentFormSchema } from "@/lib/post/form/commentFormSchema";
import { PostComment } from "@/types/post";

// 게시글 댓글 목록 조회
export const getComments = async (
  postId: number,
  cursor?: number,
  limit = 10
) => {
  const rawComments = await db.comment.findMany({
    where: { postId },
    take: limit,
    skip: cursor ? 1 : 0, // 커서 중복 방지
    cursor: cursor ? { id: cursor } : undefined,
    orderBy: { created_at: "desc" },
    select: {
      id: true,
      payload: true,
      created_at: true,
      userId: true,
      user: {
        select: { username: true, avatar: true },
      },
    },
  });

  return rawComments as PostComment[];
};

// 게시글 댓글 목록 캐싱 함수
export const getCachedComments = (postId: number): Promise<PostComment[]> => {
  const cachedOperation = nextCache(getComments, ["post-comments"], {
    tags: [`comments-${postId}`],
  });
  return cachedOperation(postId);
};

// 게시글에 댓글 작성
export const createComment = async (_: any, formData: FormData) => {
  const data = {
    payload: formData.get("payload"),
    postId: Number(formData.get("postId")),
  };
  const session = await getSession();
  const result = commentFormSchema.safeParse(data);

  if (!result.success) {
    return { success: false, errors: result.error.flatten() };
  }

  try {
    await db.comment.create({
      data: {
        payload: result.data.payload,
        postId: result.data.postId,
        userId: session.id!,
      },
    });
    await badgeChecks.onCommentCreate(session.id!);
    await badgeChecks.onEventParticipation(session.id!);
    const post = await db.post.findUnique({
      where: { id: result.data.postId },
      select: { userId: true },
    });
    if (post) await checkBoardExplorerBadge(post.userId);

    revalidateTag(`comments-${result.data.postId}`);
    return { success: true };
  } catch (e) {
    console.error(e);
    return { success: false, error: "댓글 생성 중 오류가 발생했습니다." };
  }
};

// 댓글 삭제
export const deleteComment = async (id: number, postId: number) => {
  try {
    await db.comment.delete({ where: { id } });
    revalidateTag(`comments-${postId}`);
    return { success: true };
  } catch (e) {
    console.error(e);
    return { success: false, error: "댓글 삭제 중 오류가 발생했습니다." };
  }
};
