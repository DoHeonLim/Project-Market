/**
 * File Name : components/post/postDetail/PostDetailHeader
 * Description : 게시글 상세 헤더 (카테고리, 작성자, 수정 버튼)
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2025.07.11  임도헌   Created   PostDetail Header 분리
 */
"use client";

import Link from "next/link";
import UserAvatar from "@/components/common/UserAvatar";
import { PencilSquareIcon } from "@heroicons/react/24/solid";
import { POST_CATEGORY } from "@/lib/constants";
import { PostDetail } from "@/types/post";
import { User } from "@prisma/client";

interface PostDetailHeaderProps {
  post: PostDetail;
  user: User;
}

export default function PostDetailHeader({
  post,
  user,
}: PostDetailHeaderProps) {
  return (
    <>
      {/* 카테고리 태그 */}
      {post.category && (
        <div className="flex justify-end items-center gap-2">
          <Link
            href={`/posts?category=${post.category}`}
            className="px-3 py-1.5 text-sm font-medium text-white rounded-full bg-primary/80 dark:bg-primary-light/80 hover:bg-primary dark:hover:bg-primary-light transition-colors"
          >
            {POST_CATEGORY[post.category as keyof typeof POST_CATEGORY]}
          </Link>
        </div>
      )}

      {/* 작성자 정보 + 수정 버튼 */}
      <div className="flex justify-between items-center">
        <div className="flex flex-row justify-center items-center gap-4">
          <UserAvatar
            avatar={post.user.avatar}
            username={post.user.username}
            size="md"
          />
        </div>
        {post.user.username === user.username && (
          <Link
            href={`/posts/${post.id}/edit`}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white rounded-md bg-primary/80 dark:bg-primary-light/80 hover:bg-primary dark:hover:bg-primary-light transition-colors"
          >
            <PencilSquareIcon className="size-4" />
            <span>수정</span>
          </Link>
        )}
      </div>
    </>
  );
}
