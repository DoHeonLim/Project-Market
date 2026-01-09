/**
 * File Name : components/post/PostCard/PostCardTitle
 * Description : 게시글 제목
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2025.07.04  임도헌   Created
 */
"use client";

interface PostCardTitleProps {
  title: string;
  viewMode: "list" | "grid";
}

export default function PostCardTitle({ title, viewMode }: PostCardTitleProps) {
  return (
    <h2
      className={`font-semibold text-text dark:text-text-dark group-hover:text-primary dark:group-hover:text-primary-light transition-colors
    ${viewMode === "grid" ? "text-sm sm:text-base line-clamp-2" : "text-base sm:text-lg line-clamp-1"}`}
    >
      {title}
    </h2>
  );
}
