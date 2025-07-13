/**
 * File Name : app/posts/[id]/actions/post
 * Description : 게시글 조회 및 삭제 관련 서버 액션
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2025.07.06  임도헌   Created   게시글 관련 서버 액션 분리
 */
"use server";

import db from "@/lib/db";
import getSession from "@/lib/session";
import { notFound } from "next/navigation";
import { revalidateTag, unstable_cache as nextCache } from "next/cache";

//게시글 상세 조회 및 조회수 1 증가
export const getPost = async (id: number) => {
  try {
    return await db.post.update({
      where: { id },
      data: { views: { increment: 1 } },
      include: {
        user: { select: { username: true, avatar: true } },
        _count: { select: { comments: true, post_likes: true } },
        images: { orderBy: { order: "asc" } },
        tags: true,
      },
    });
  } catch (e) {
    console.error(e);
    return null;
  }
};

// 게시글 상세 조회 캐싱 함수
export const getCachedPost = async (postId: number) => {
  const cachedOperation = nextCache(getPost, ["post-detail"], {
    tags: [`post-detail-${postId}`],
  });
  return cachedOperation(postId);
};

// 게시글 삭제
export const deletePost = async (id: number) => {
  try {
    await db.post.delete({ where: { id } });
    revalidateTag(`post-detail-${id}`);
    return { success: true };
  } catch (e) {
    console.error(e);
    return { success: false, error: "게시글 삭제 중 오류가 발생했습니다." };
  }
};

// 현재 로그인한 사용자 정보 조회
export const getUser = async () => {
  const session = await getSession();
  if (session?.id) {
    const user = await db.user.findUnique({ where: { id: session.id } });
    if (user) return user;
  }
  return notFound();
};
