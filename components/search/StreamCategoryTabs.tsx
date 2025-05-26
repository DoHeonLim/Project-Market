/**
File Name : components/search/StreamCategoryTabs
Description : 스트리밍 카테고리 탭
Author : 임도헌

History
Date        Author   Status    Description
2025.05.22  임도헌   Created
2025.05.22  임도헌   Modified  스트리밍 카테고리 탭 추가
*/
"use client";

import Link from "next/link";
import { STREAM_CATEGORY } from "@/lib/constants";

interface StreamCategoryTabsProps {
  currentCategory?: string;
}

export default function StreamCategoryTabs({
  currentCategory,
}: StreamCategoryTabsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      <Link
        href="/live"
        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
          !currentCategory
            ? "bg-primary text-white dark:bg-primary-light"
            : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        }`}
      >
        전체
      </Link>
      {Object.entries(STREAM_CATEGORY).map(([key, value]) => (
        <Link
          key={key}
          href={`/live?category=${key}`}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
            currentCategory === key
              ? "bg-primary text-white dark:bg-primary-light"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          }`}
        >
          {value}
        </Link>
      ))}
    </div>
  );
}
