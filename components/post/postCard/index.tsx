/**
 * File Name : components/post/PostCard/index
 * Description : 게시글 목록의 개별 카드 컴포넌트
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2025.06.26  임도헌   Created   게시글 카드 컴포넌트 분리
 * 2025.07.04  임도헌   Modified   PostCard 컴포넌트 기능별 분리
 */
"use client";

import Link from "next/link";
import { PostDetail } from "@/types/post";
import PostCardHeader from "./PostCardHeader";
import PostCardMeta from "./PostCardMeta";
import PostCardThumbnail from "./PostCardThumbnail";
import PostCardTitle from "./PostCardTitle";
import PostCardTags from "./PostCardTag";

interface PostCardProps {
  post: PostDetail;
  viewMode: "list" | "grid";
}

export default function PostCard({ post, viewMode }: PostCardProps) {
  return (
    <Link
      href={`/posts/${post.id}`}
      className={`${
        viewMode === "grid"
          ? "flex flex-col h-full p-4 border border-neutral-200 dark:border-neutral-700 rounded-md hover:bg-neutral-100/50 dark:hover:bg-neutral-800/50 hover:shadow-lg transition-all group"
          : "flex flex-row gap-4 p-4 border-b border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-neutral-100/50 dark:hover:bg-neutral-800/50 transition-all group"
      }`}
    >
      <PostCardThumbnail images={post.images} viewMode={viewMode} />

      <div
        className={`flex flex-col ${viewMode === "grid" ? "mt-2 gap-1" : "flex-1 justify-between"}`}
      >
        <PostCardHeader category={post.category} />
        <PostCardTitle title={post.title} viewMode={viewMode} />
        <PostCardMeta
          views={post.views}
          likes={post._count.post_likes}
          comments={post._count.comments}
          createdAt={post.created_at.toString()}
        />
        <PostCardTags tags={post.tags} />
      </div>
    </Link>
  );
}
