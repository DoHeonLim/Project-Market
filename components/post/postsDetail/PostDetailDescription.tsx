/**
 * File Name : components/post/postDetail/PostDetailDescription
 * Description : 게시글 상세 설명
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2025.07.11  임도헌   Created   PostDetail Description 분리
 */
"use client";

interface PostDetailDescriptionProps {
  description?: string | null;
}

export default function PostDetailDescription({
  description,
}: PostDetailDescriptionProps) {
  if (!description) return null;

  return (
    <p className="text-base leading-relaxed text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap">
      {description}
    </p>
  );
}
