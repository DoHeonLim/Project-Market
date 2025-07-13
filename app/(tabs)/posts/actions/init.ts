/**
File Name : app/(tabs)/posts/actions/init
Description : 항해일지 페이지 액션
Author : 임도헌

History
Date        Author   Status    Description
2025.05.06  임도헌   Created
2025.05.06  임도헌   Modified  게시글 페이지 액션 추가
2025.06.26  임도헌   Created   게시글 초기 로딩 및 무한 스크롤 처리
2025.07.04  임도헌   Modified  getMorePosts에 searchParams 추가
2025.07.04  임도헌   Modified  전체 액션 커서 처리 통일
*/
"use server";

import db from "@/lib/db";
import { POST_SELECT } from "@/lib/constants/postSelect";
import { Posts } from "@/types/post";
import {
  getPostSearchCondition,
  PostSearchParams,
} from "@/lib/queries/getPostSearchCondition";

const TAKE = 10;
/**
 * 공통 게시글 로드 로직
 */
export const fetchPosts = async (
  searchParams?: PostSearchParams,
  cursor?: number | null
): Promise<Posts> => {
  const where = searchParams ? getPostSearchCondition(searchParams) : undefined;

  const posts = await db.post.findMany({
    where,
    select: POST_SELECT,
    orderBy: { created_at: "desc" },
    take: TAKE + 1, // ✅ 다음 페이지 여부 판단 위해 1개 더
    ...(cursor && {
      skip: 1,
      cursor: { id: cursor },
    }),
  });

  const hasNextPage = posts.length > TAKE;
  const paginatedPosts = hasNextPage ? posts.slice(0, TAKE) : posts;
  const nextCursor = hasNextPage
    ? paginatedPosts[paginatedPosts.length - 1].id
    : null;

  return {
    posts: paginatedPosts,
    nextCursor,
  };
};

/**
 * 초기 게시글 10개 가져오기
 */
export const getInitialPosts = async (): Promise<Posts> => {
  return fetchPosts();
};

/**
 * 무한 스크롤: 다음 10개 게시글 가져오기
 */
export const getMorePosts = async (
  cursor: number | null,
  searchParams: Record<string, string>
): Promise<Posts> => {
  return fetchPosts(searchParams, cursor);
};
