/**
 * File Name : components/post/PostList
 * Description : 게시글 목록 렌더링 컴포넌트
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2025.06.26  임도헌   Created   게시글 목록 렌더링 컴포넌트 구현
 * 2025.07.04  임도헌   Modified  검색 조건 변경 시 상태 초기화
 */

"use client";

import { useRef, useEffect, useState } from "react";
import { PostDetail } from "@/types/post";
import PostListSkeleton from "./PostListSkeleton";
import { usePostPagination } from "@/hooks/usePostPagination";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { useSearchParams } from "next/navigation";
import { ListBulletIcon, Squares2X2Icon } from "@heroicons/react/24/outline";
import PostCard from "./postCard";

interface PostListProps {
  initialPosts: PostDetail[];
  nextCursor: number | null;
}

export default function PostList({ initialPosts, nextCursor }: PostListProps) {
  const searchParams = useSearchParams();
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const { posts, isLoading, hasMore, loadMore, reset } = usePostPagination({
    initialPosts,
    initialCursor: nextCursor,
    searchParams: Object.fromEntries(searchParams.entries()), // ✅ 현재 검색 조건 전달
  });

  const triggerRef = useRef<HTMLDivElement | null>(null);

  useInfiniteScroll({
    triggerRef,
    hasMore,
    isLoading,
    onLoadMore: loadMore,
  });

  // ✅ 검색 조건 변경 시 상태 초기화
  useEffect(() => {
    reset();
  }, [searchParams, reset]);

  return (
    <>
      {/* 뷰 모드 전환 버튼 */}
      <div className="flex justify-end gap-2 mb-2">
        <button
          onClick={() => setViewMode("list")}
          className={`p-2 rounded-lg transition-colors ${
            viewMode === "list"
              ? "bg-primary/10 text-primary dark:bg-primary-light/10 dark:text-primary-light"
              : "text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          }`}
          aria-label="리스트 뷰"
        >
          <ListBulletIcon className="size-5" />
        </button>
        <button
          onClick={() => setViewMode("grid")}
          className={`p-2 rounded-lg transition-colors ${
            viewMode === "grid"
              ? "bg-primary/10 text-primary dark:bg-primary-light/10 dark:text-primary-light"
              : "text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          }`}
          aria-label="그리드 뷰"
        >
          <Squares2X2Icon className="size-5" />
        </button>
      </div>
      <div
        className={`grid gap-4 ${
          viewMode === "grid" ? "grid grid-cols-2" : "flex flex-col"
        }`}
      >
        {posts.map((post) => (
          <PostCard key={post.id} post={post} viewMode={viewMode} />
        ))}
      </div>

      {isLoading && <PostListSkeleton viewMode={viewMode} />}

      <div ref={triggerRef} className="h-4" />
    </>
  );
}
