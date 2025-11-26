/**
File Name : app/(tabs)/posts/page
Description : 항해일지 페이지
Author : 임도헌

History
Date        Author   Status    Description
2024.10.14  임도헌   Created
2024.10.14  임도헌   Modified  동네생활 페이지 추가
2024.11.23  임도헌   Modified  게시글을 최신 게시글순으로 출력되게 수정
2024.11.23  임도헌   Modified  게시글 생성 링크 추가
2024.12.12  임도헌   Modified  게시글 좋아요 명 변경
2024.12.12  임도헌   Modified  게시글 생성 시간 표시 변경
2024.12.18  임도헌   Modified  항해일지 페이지로 변경(동네생활 -> 항해일지)
2024.12.23  임도헌   Modified  게시글 페이지 다크모드 추가
2025.05.06  임도헌   Modified  그리드/리스트 뷰 모드 추가
2025.05.06  임도헌   Modified  게시글 페이지 컴포넌트 수정
2025.06.26  임도헌   Modified  PostList, PostCard 분리 및 검색 구조 개선
2025.11.20  임도헌   Modified  게시글 페이지 동적으로 변경
*/

export const dynamic = "force-dynamic";

import PostList from "@/components/post/PostList";
import { getInitialPosts } from "./actions/init";
import PostEmptyState from "@/components/post/PostEmptyState";
import AddPostButton from "@/components/post/AddPostButton";
import { searchPosts } from "./actions/search";
import PostSearchBarWrapper from "@/components/post/PostSearchBarWrapper";
import PostCategoryTabs from "@/components/search/PostCategoryTabs";

interface PostsPageProps {
  searchParams: {
    keyword?: string;
    category?: string;
  };
}

export default async function PostsPage({ searchParams }: PostsPageProps) {
  const hasSearchParams = Object.keys(searchParams).length > 0;

  const initialData = hasSearchParams
    ? await searchPosts({
        keyword: searchParams.keyword,
        category: searchParams.category,
      })
    : await getInitialPosts();

  return (
    <div className="flex flex-col min-h-screen bg-background dark:bg-background-dark">
      {/* 검색창 */}
      <div className="sticky top-0 z-10 p-4 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm border-b border-neutral-200 dark:border-neutral-700">
        <PostCategoryTabs currentCategory={searchParams.category} />
        <div className="mt-4 flex items-center justify-between gap-4">
          <PostSearchBarWrapper />
        </div>
      </div>

      {/* 게시글 목록 or Empty 상태 */}
      <div className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
        {initialData.posts.length > 0 ? (
          <PostList
            key={JSON.stringify(searchParams)}
            initialPosts={initialData.posts}
            nextCursor={initialData.nextCursor}
          />
        ) : (
          <PostEmptyState
            keyword={searchParams.keyword}
            category={searchParams.category}
          />
        )}
      </div>

      {/* 게시글 추가 버튼 */}
      <AddPostButton />
    </div>
  );
}
