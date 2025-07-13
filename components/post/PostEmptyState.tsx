/**
 * File Name : components/post/PostEmptyState
 * Description : 게시글 목록이 비어있을 때 표시되는 컴포넌트
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2025.06.26  임도헌   Created   게시글 비어있을 때 UI 추가
 * 2025.07.04  임도헌   Modified  검색 조건별 안내 메시지 개선
 */
"use client";

import { POST_CATEGORY } from "@/lib/constants";
import { PlusIcon } from "@heroicons/react/24/solid";
import Link from "next/link";

interface PostEmptyStateProps {
  keyword?: string;
  category?: string;
}

export default function PostEmptyState({
  keyword,
  category,
}: PostEmptyStateProps) {
  let message = "아직 작성된 게시글이 없습니다. 첫 게시글을 작성해보세요!";
  if (keyword && category) {
    message = `검색어 '${keyword}'에 대한 카테고리 '${POST_CATEGORY[category as keyof typeof POST_CATEGORY]}'의 게시글이 없습니다.`;
  } else if (keyword) {
    message = `검색어 '${keyword}'에 대한 게시글이 없습니다.`;
  } else if (category) {
    message = `카테고리 '${category}'에 게시글이 없습니다.`;
  }

  return (
    <div className="flex flex-col items-center justify-center h-full text-center text-neutral-500">
      <p className="text-lg">{message}</p>
      <Link
        href="/posts/add"
        className="mt-6 inline-flex items-center px-4 py-2 text-white bg-primary rounded-lg shadow hover:bg-primary-dark transition-colors"
      >
        <PlusIcon className="w-5 h-5 mr-2" />
        게시글 작성
      </Link>
    </div>
  );
}
