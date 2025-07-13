/**
 * File Name : components/post/PostListSkeleton
 * Description : 게시글 목록 로딩 시 보여줄 스켈레톤 목록 컴포넌트
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2025.06.26  임도헌   Created   게시글 무한 스크롤용 스켈레톤 목록 구현
 */

"use client";

import PostCardSkeleton from "./PostCardSkeleton";

interface PostListSkeletonProps {
  viewMode: "list" | "grid";
  count?: number;
}

export default function PostListSkeleton({
  viewMode,
  count = 4,
}: PostListSkeletonProps) {
  const items = Array.from({ length: count });

  return (
    <div
      className={
        viewMode === "grid"
          ? "grid grid-cols-1 sm:grid-cols-2 gap-4"
          : "flex flex-col gap-4"
      }
    >
      {items.map((_, idx) => (
        <PostCardSkeleton key={idx} viewMode={viewMode} />
      ))}
    </div>
  );
}
