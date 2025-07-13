/**
 * File Name : components/post/PostCardSkeleton
 * Description : 게시글 카드 로딩용 스켈레톤 UI
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2025.06.26  임도헌   Created   게시글 카드 스켈레톤 컴포넌트 구현
 */

"use client";

import Skeleton from "@/components/common/skeleton";

interface PostCardSkeletonProps {
  viewMode: "list" | "grid";
}

export default function PostCardSkeleton({ viewMode }: PostCardSkeletonProps) {
  return (
    <div
      className={`rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-4 ${
        viewMode === "grid" ? "flex flex-col" : "flex gap-4"
      }`}
    >
      {/* 썸네일 */}
      <div
        className={`relative overflow-hidden rounded-lg bg-neutral-200 dark:bg-neutral-700 animate-pulse ${
          viewMode === "grid"
            ? "aspect-square w-full"
            : "size-24 sm:size-32 flex-shrink-0"
        }`}
      />

      {/* 텍스트 정보 */}
      <div
        className={`flex flex-col flex-1 ${viewMode === "grid" ? "mt-3" : ""}`}
      >
        <div className="flex items-center justify-between">
          <Skeleton className="w-20 h-4 rounded-full" />
          <Skeleton className="w-6 h-6 rounded-full" />
        </div>

        <Skeleton
          className={`rounded-full ${
            viewMode === "grid" ? "h-4 mt-2 w-3/4" : "h-5 mt-2 w-1/2"
          }`}
        />
        {viewMode === "grid" && (
          <Skeleton className="h-4 mt-1 w-full rounded-full" />
        )}

        <div className="flex items-center justify-between mt-auto gap-4">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-10 rounded-full" />
            <Skeleton className="h-4 w-10 rounded-full" />
            <Skeleton className="h-4 w-10 rounded-full" />
          </div>
          <Skeleton className="h-4 w-16 rounded-full" />
        </div>
      </div>
    </div>
  );
}
