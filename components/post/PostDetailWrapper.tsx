/**
 * File Name : components/post/PostDetailWrapper
 * Description : 게시글 상세 페이지 몰입형 UI (Wave Header 포함)
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2025.07.06  임도헌   Created   몰입형 Wave 디자인 적용
 * 2025.07.11  임도헌   Modified  기능별 컴포넌트 분리
 */
"use client";

import { motion } from "framer-motion";
import PostLikeButton from "@/components/post/PostLikeButton";
import Carousel from "@/components/common/Carousel";
import Comment from "@/components/post/comment/Comment";
import TimeAgo from "@/components/common/TimeAgo";
import UserAvatar from "@/components/common/UserAvatar";
import { PencilSquareIcon, EyeIcon } from "@heroicons/react/24/solid";
import Link from "next/link";
import { PostDetail } from "@/types/post";
import { User } from "@prisma/client";
import { POST_CATEGORY } from "@/lib/constants";

interface PostDetailWrapperProps {
  post: PostDetail;
  user: User;
  likeCount: number;
  isLiked: boolean;
}

export default function PostDetailWrapper({
  post,
  user,
  likeCount,
  isLiked,
}: PostDetailWrapperProps) {
  return (
    <div className="max-w-3xl mx-auto min-h-screen bg-gradient-to-b from-neutral-50 to-neutral-100 dark:from-neutral-900 dark:to-neutral-950">
      {/* 본문 카드 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{
          opacity: 1,
          y: 0,
          transition: { type: "spring", stiffness: 120 },
        }}
        className="p-5 bg-white dark:bg-neutral-800 rounded-xl shadow-lg space-y-5"
      >
        <div className="flex items-center gap-3">
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
        </div>
        {/* 작성자 정보 */}
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

        {/* 제목 */}
        <h1 className="text-3xl font-bold text-text dark:text-text-dark">
          {post.title}
        </h1>

        {/* 설명 */}
        {post.description && (
          <p className="text-base leading-relaxed text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap">
            {post.description}
          </p>
        )}

        {/* 이미지 Carousel */}
        {post.images.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1, transition: { delay: 0.2 } }}
            className="relative aspect-video w-full overflow-hidden mt-6 rounded-xl shadow"
          >
            <Carousel images={post.images} className="w-full h-full" />
          </motion.div>
        )}

        {/* 메타 정보 */}
        <div className="flex justify-between items-center pt-2 border-t border-neutral-200 dark:border-neutral-700">
          <PostLikeButton
            isLiked={isLiked}
            likeCount={likeCount}
            postId={post.id}
          />
          <div className="flex items-center gap-3 text-sm text-neutral-500 dark:text-neutral-400">
            <EyeIcon className="size-4" />
            <span>{post.views}</span>
            <TimeAgo date={post.created_at?.toString() ?? ""} />
          </div>
        </div>
        <h3 className="text-xl font-semibold mb-4 text-text dark:text-text-dark">
          💬 항해 로그
        </h3>
        <Comment postId={post.id} user={user} />
      </motion.div>
    </div>
  );
}
