/**
 * File Name : components/post/PostCard/PostCardHeader
 * Description : 게시글 상단 카테고리 + 작성자 아바타
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2025.07.04  임도헌   Created
 */
"use client";

import { POST_CATEGORY } from "@/lib/constants";

interface PostCardHeaderProps {
  category: string;
}

export default function PostCardHeader({ category }: PostCardHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <span className="px-2 py-1 text-[10px] sm:text-xs font-medium text-white rounded-full bg-primary/80 dark:bg-primary-light/80">
        {POST_CATEGORY[category as keyof typeof POST_CATEGORY]}
      </span>
    </div>
  );
}
