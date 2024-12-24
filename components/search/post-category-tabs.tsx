/**
File Name : components/search/post-category-tabs.tsx
Description : 게시글 카테고리 탭 컴포넌트
Author : 임도헌

History
Date        Author   Status    Description
2024.12.19  임도헌   Created
2024.12.19  임도헌   Modified  게시글 카테고리 탭 컴포넌트 생성
2024.12.20  임도헌   Modified  게시글 카테고리 탭 컴포넌트 다크모드 추가
*/
"use client";

import { POST_CATEGORY } from "@/lib/constants";
import Link from "next/link";

interface IPostCategoryTabsProps {
  currentCategory?: string;
}

export default function PostCategoryTabs({
  currentCategory,
}: IPostCategoryTabsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      <Link
        href="/posts"
        className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
          !currentCategory
            ? "bg-indigo-400 dark:bg-indigo-500 text-white"
            : "bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-neutral-400 hover:bg-gray-200 dark:hover:bg-neutral-700"
        }`}
      >
        전체
      </Link>
      {Object.entries(POST_CATEGORY).map(([key, value]) => (
        <Link
          key={key}
          href={`/posts?category=${key}`}
          className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
            currentCategory === key
              ? "bg-indigo-400 dark:bg-indigo-500 text-white"
              : "bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-neutral-400 hover:bg-gray-200 dark:hover:bg-neutral-700"
          }`}
        >
          {value}
        </Link>
      ))}
    </div>
  );
}
