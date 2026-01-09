/**
 * File Name : components/post/postCard/PostCardTags
 * Description : 게시글 태그 목록 (최대 2개 + "외 n개")
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2025.07.04  임도헌   Created   Tags 분리 및 축약
 */

"use client";

interface PostCardTagsProps {
  tags: { name: string }[];
}

export default function PostCardTags({ tags }: PostCardTagsProps) {
  if (!tags.length) return null;

  const visibleTags = tags.slice(0, 2);
  const hiddenCount = tags.length - visibleTags.length;

  return (
    <div className="flex flex-wrap gap-1 mt-1">
      {visibleTags.map((tag, index) => (
        <span
          key={index}
          className="px-1.5 py-0.5 text-[10px] sm:text-xs bg-primary/10 text-primary dark:bg-primary-light/10 dark:text-primary-light rounded-full"
        >
          🏷️ {tag.name}
        </span>
      ))}
      {hiddenCount > 0 && (
        <span className="px-1.5 py-0.5 text-[10px] sm:text-xs bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 rounded-full">
          +{hiddenCount}개
        </span>
      )}
    </div>
  );
}
