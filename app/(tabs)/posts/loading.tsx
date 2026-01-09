/**
File Name : app/(tabs)/posts/loading
Description : 항해일지 로딩 페이지
Author : 임도헌

History
Date        Author   Status    Description
2024.11.01  임도헌   Created
2024.11.01  임도헌   Modified  동네생활 로딩 페이지 추가
2024.12.18  임도헌   Modified  항해일지 로딩 페이지 추가
2024.12.18  임도헌   Modified  카테고리 탭 스켈레톤 추가
2025.06.26  임도헌   Created   상단 필터 고정 + 스켈레톤 UI 적용
*/
import PostListSkeleton from "@/components/post/PostListSkeleton";

export default function PostsLoading() {
  return (
    <div className="flex flex-col min-h-screen bg-neutral-50 dark:bg-neutral-900">
      {/* 헤더(탭 및 검색창 자리) 유지 */}
      <div className="sticky top-0 z-10 p-4 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm border-b border-neutral-200 dark:border-neutral-700 h-[100px]" />
      {/* 게시글 리스트 스켈레톤 */}
      <PostListSkeleton viewMode="list" />
    </div>
  );
}
