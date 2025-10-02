/**
File Name : app/(tabs)/posts/actions/search
Description : 항해일지 페이지 액션
Author : 임도헌

History
Date        Author   Status    Description
2025.05.06  임도헌   Created
2025.05.06  임도헌   Modified  게시글 페이지 액션 추가
2025.07.04  임도헌   Modified  게시글 검색 간소화
*/
import { fetchPosts } from "./init"; // 공통 로직 재사용
import { PostSearchParams } from "@/lib/queries/getPostSearchCondition";
import { Posts } from "@/types/post";

/**
 * 게시글 검색
 */
export const searchPosts = async (params: PostSearchParams): Promise<Posts> => {
  return fetchPosts(params);
};
