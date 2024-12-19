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
            ? "bg-indigo-400 text-white"
            : "bg-neutral-800 text-neutral-400 hover:bg-neutral-700"
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
              ? "bg-indigo-400 text-white"
              : "bg-neutral-800 text-neutral-400 hover:bg-neutral-700"
          }`}
        >
          {value}
        </Link>
      ))}
    </div>
  );
}
