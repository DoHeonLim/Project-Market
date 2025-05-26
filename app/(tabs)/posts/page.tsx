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
*/

"use client";

import TimeAgo from "@/components/common/TimeAgo";
import {
  PhotoIcon,
  Squares2X2Icon,
  ListBulletIcon,
} from "@heroicons/react/24/outline";
import { EyeIcon, HeartIcon, PlusIcon } from "@heroicons/react/24/solid";
import Link from "next/link";
import { POST_CATEGORY } from "@/lib/constants";
import Image from "next/image";
import PostCategoryTabs from "../../../components/search/PostCategoryTabs";
import SearchBar from "@/components/search/SearchBar";
import UserAvatar from "@/components/common/UserAvatar";
import { useState, useEffect } from "react";
import { getPosts, PostItem } from "./actions";

// searchParams로 카테고리 필터링
interface PostsPageProps {
  searchParams: {
    category?: string;
    keyword?: string;
  };
}

export default function PostsPage({ searchParams }: PostsPageProps) {
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  // 컴포넌트가 마운트될 때 게시글 데이터를 가져옵니다.
  useEffect(() => {
    const fetchPosts = async () => {
      const data = await getPosts(searchParams.category, searchParams.keyword);
      setPosts(data);
    };
    fetchPosts();
  }, [searchParams.category, searchParams.keyword]);

  return (
    <div className="flex flex-col min-h-screen bg-neutral-50 dark:bg-neutral-900">
      {/* 카테고리 탭 컨테이너 */}
      <div className="sticky top-0 z-10 p-4 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm border-b border-neutral-200 dark:border-neutral-700">
        <div className="relative">
          <PostCategoryTabs currentCategory={searchParams.category} />
        </div>
        <div className="mt-4 flex items-center justify-between gap-4">
          <SearchBar
            basePath="/posts"
            placeholder="⚓ 항해 일지 검색"
            additionalParams={{
              category: searchParams.category ?? "",
            }}
          />
          {/* 뷰 모드 전환 버튼 */}
          <div className="flex gap-2">
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
        </div>
      </div>

      {/* 게시글 목록 */}
      <div className="flex-1 p-4">
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 sm:grid-cols-2 gap-4"
              : "flex flex-col gap-4"
          }
        >
          {posts.length > 0 ? (
            posts.map((post) => (
              <Link
                key={post.id}
                href={`/posts/${post.id}`}
                className={`group transition-all bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700/50 border border-neutral-200 dark:border-neutral-700 rounded-xl hover:shadow-lg hover:shadow-primary/5 dark:hover:shadow-primary-light/5 ${
                  viewMode === "grid" ? "flex flex-col p-4" : "flex gap-4 p-4"
                }`}
              >
                <div className="flex flex-col gap-1">
                  {/* 게시글 썸네일 */}
                  <div
                    className={`relative overflow-hidden rounded-lg ${
                      viewMode === "grid"
                        ? "aspect-square w-full"
                        : "size-24 sm:size-32 flex-shrink-0"
                    }`}
                  >
                    {post.images[0] ? (
                      <Image
                        src={`${post.images[0].url}/public`}
                        alt={post.title}
                        fill
                        sizes={
                          viewMode === "grid"
                            ? "(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                            : "128px"
                        }
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full bg-neutral-100 dark:bg-neutral-700">
                        <PhotoIcon className="w-8 h-8 text-neutral-400" />
                      </div>
                    )}
                  </div>
                </div>

                {/* 게시글 내용 */}
                <div
                  className={`flex flex-col ${
                    viewMode === "grid" ? "mt-3" : "flex-1"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 text-xs font-medium text-white rounded-full bg-primary/80 dark:bg-primary-light/80">
                        {
                          POST_CATEGORY[
                            post.category as keyof typeof POST_CATEGORY
                          ]
                        }
                      </span>
                    </div>
                    <UserAvatar
                      avatar={post.user.avatar}
                      username={post.user.username}
                      size="sm"
                      disabled={true}
                    />
                  </div>
                  <h2
                    className={`font-semibold text-text dark:text-text-dark group-hover:text-primary dark:group-hover:text-primary-light transition-colors ${
                      viewMode === "grid"
                        ? "text-sm sm:text-base line-clamp-2"
                        : "text-base sm:text-lg line-clamp-1"
                    }`}
                  >
                    {post.title}
                  </h2>

                  <div
                    className={`flex items-center justify-between gap-4 text-sm text-neutral-500 dark:text-neutral-400 ${
                      viewMode === "grid" ? "mt-3" : "mt-auto"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <EyeIcon className="size-4" />
                        {post.views}
                      </span>
                      <span className="flex items-center gap-1">
                        <HeartIcon className="size-4 text-rose-600" />
                        {post._count.post_likes}
                      </span>
                      <span className="flex items-center gap-1">
                        💬 {post._count.comments}
                      </span>
                    </div>
                    <TimeAgo date={post.created_at?.toString()} />
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center w-full py-12 bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700">
              <span className="text-lg font-semibold text-neutral-600 dark:text-neutral-300">
                게시글이 없습니다
              </span>
              <span className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
                첫 번째 게시글을 작성해보세요!
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 글쓰기 버튼 */}
      <Link
        href="posts/add"
        className="fixed flex items-center justify-center text-white transition-all bg-primary dark:bg-primary-light hover:bg-primary/90 dark:hover:bg-primary-light/90 hover:scale-105 active:scale-95 rounded-full size-16 bottom-24 right-8 shadow-lg shadow-primary/30 dark:shadow-primary-light/30"
      >
        <PlusIcon aria-label="add_post" className="size-10" />
      </Link>
    </div>
  );
}
