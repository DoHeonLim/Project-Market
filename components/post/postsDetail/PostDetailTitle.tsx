/**
 * File Name : components/post/postDetail/PostDetailTitle
 * Description : 게시글 상세 제목
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2025.07.11  임도헌   Created   PostDetail Title 분리
 */
"use client";

interface PostDetailTitleProps {
  title: string;
}

export default function PostDetailTitle({ title }: PostDetailTitleProps) {
  return (
    <h1 className="text-3xl font-bold text-text dark:text-text-dark">
      {title}
    </h1>
  );
}
