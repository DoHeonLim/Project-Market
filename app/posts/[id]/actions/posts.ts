/**
 * File Name : app/posts/[id]/actions/post
 * Description : 게시글 조회 및 삭제 관련 서버 액션
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2025.07.06  임도헌   Created   게시글 관련 서버 액션 분리
 * 2025.11.20  임도헌   Modified  조회수 증가 로직 캐시에서 분리, revalidate 태그/경로 정리
 */
"use server";

import db from "@/lib/db";
import getSession from "@/lib/session";
import { notFound } from "next/navigation";
import { revalidateTag, unstable_cache as nextCache } from "next/cache";

const POST_DETAIL_TAG_PREFIX = "post-detail-id-";

/**
 * 게시글 상세 조회 (순수 쿼리, 부수효과 없음)
 */
export const getPost = async (id: number) => {
  try {
    return await db.post.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            comments: true,
            post_likes: true,
          },
        },
        images: {
          orderBy: { order: "asc" },
        },
        tags: true,
      },
    });
  } catch (e) {
    console.error(e);
    return null;
  }
};

/**
 * 조회수 1 증가 (캐시와 분리된 부수효과 전용)
 */
export const incrementPostViews = async (id: number) => {
  try {
    await db.post.update({
      where: { id },
      data: { views: { increment: 1 } },
    });
  } catch (e) {
    // 조회수는 실패해도 치명적이지 않으니 로그만 남김
    console.error(e);
  }
};

/**
 * 게시글 상세 조회 캐싱 함수
 */
export const getCachedPost = async (postId: number) => {
  const cachedOperation = nextCache(getPost, ["post-detail", String(postId)], {
    tags: [`${POST_DETAIL_TAG_PREFIX}${postId}`],
  });

  return cachedOperation(postId);
};

/**
 * 게시글 삭제
 */
export const deletePost = async (id: number) => {
  try {
    await db.post.delete({ where: { id } });

    // 상세/리스트 모두 무효화
    revalidateTag(`${POST_DETAIL_TAG_PREFIX}${id}`);

    return { success: true };
  } catch (e) {
    console.error(e);
    return {
      success: false,
      error: "게시글 삭제 중 오류가 발생했습니다.",
    };
  }
};

/**
 * 현재 로그인한 사용자 정보 조회
 */
export const getUser = async () => {
  const session = await getSession();
  if (session?.id) {
    const user = await db.user.findUnique({ where: { id: session.id } });
    if (user) return user;
  }
  return notFound();
};
