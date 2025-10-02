/**
 * File Name : app/posts/[id]/actions/likes
 * Description : 게시글 좋아요 관련 서버 액션
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2025.07.06  임도헌   Created   좋아요 관련 서버 액션 분리
 */
"use server";

import db from "@/lib/db";
import getSession from "@/lib/session";
import {
  checkBoardExplorerBadge,
  checkPopularWriterBadge,
} from "@/lib/check-badge-conditions";
import { revalidateTag, unstable_cache as nextCache } from "next/cache";

// 게시글 좋아요 상태 조회
export const getLikeStatus = async (postId: number, userId: number) => {
  const isLiked = await db.postLike.findUnique({
    where: { id: { postId, userId } },
  });
  const likeCount = await db.postLike.count({ where: { postId } });
  return { likeCount, isLiked: Boolean(isLiked) };
};

//좋아요 상태 캐싱 함수
export const getCachedLikeStatus = async (postId: number) => {
  const session = await getSession();
  if (!session?.id) return { likeCount: 0, isLiked: false };

  const cachedOperation = nextCache(getLikeStatus, ["post-like-status"], {
    tags: [`post-like-status-${postId}`],
  });
  return cachedOperation(postId, session.id);
};

// 게시글에 좋아요 추가
export const likePost = async (postId: number) => {
  const session = await getSession();
  const post = await db.post.findUnique({
    where: { id: postId },
    select: { userId: true },
  });
  if (!post) return;

  await db.postLike.create({
    data: { postId, userId: session.id! },
  });

  await checkPopularWriterBadge(post.userId);
  await checkBoardExplorerBadge(post.userId);
  revalidateTag(`post-like-status-${postId}`);
};

// 게시글 좋아요 취소
export const dislikePost = async (postId: number) => {
  const session = await getSession();
  await db.postLike.delete({
    where: { id: { postId, userId: session.id! } },
  });
  revalidateTag(`post-like-status-${postId}`);
};
