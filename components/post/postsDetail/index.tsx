/**
 * File Name : components/post/postsDetail/index
 * Description : 게시글 상세 페이지 Wrapper
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2025.07.06  임도헌   Created   몰입형 Wave 디자인 적용
 * 2025.07.11  임도헌   Modified  게시글 상세 페이지 기능별로 컴포넌트 분리
 */
"use client";

import BackButton from "@/components/common/BackButton";
import { PostDetail } from "@/types/post";
import { User } from "@prisma/client";
import { motion } from "framer-motion";
import PostDetailHeader from "./PostDetailHeader";
import PostDetailTitle from "./PostDetailTitle";
import PostDetailDescription from "./PostDetailDescription";
import PostDetailCarousel from "./PostDetailCarousel";
import PostDetailMeta from "./PostDetailMeta";
import Comment from "../comment/Comment";

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
      <BackButton href="/posts" className="pt-3 pl-3" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{
          opacity: 1,
          y: 0,
          transition: { type: "spring", stiffness: 120 },
        }}
        className="p-5 bg-white dark:bg-neutral-800 rounded-xl shadow-lg space-y-5"
      >
        <PostDetailHeader post={post} user={user} />
        <PostDetailTitle title={post.title} />
        <PostDetailDescription description={post.description} />
        <PostDetailCarousel images={post.images} />
        <PostDetailMeta
          postId={post.id}
          isLiked={isLiked}
          likeCount={likeCount}
          views={post.views}
          createdAt={post.created_at?.toString() ?? ""}
        />
        <h3 className="text-xl font-semibold mb-4 text-text dark:text-text-dark">
          💬 항해 로그
        </h3>
        <Comment postId={post.id} user={user} />
      </motion.div>
    </div>
  );
}
