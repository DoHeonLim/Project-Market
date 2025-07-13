/**
 * File Name : components/post/postDetail/PostDetailMeta
 * Description : 게시글 상세 메타 정보 (좋아요 버튼, 조회수, 작성일)
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2025.07.11  임도헌   Created   PostDetail Meta 분리
 */
"use client";

import PostLikeButton from "@/components/post/PostLikeButton";
import { EyeIcon } from "@heroicons/react/24/solid";
import TimeAgo from "@/components/common/TimeAgo";

interface PostDetailMetaProps {
  postId: number;
  isLiked: boolean;
  likeCount: number;
  views: number;
  createdAt: string;
}

export default function PostDetailMeta({
  postId,
  isLiked,
  likeCount,
  views,
  createdAt,
}: PostDetailMetaProps) {
  return (
    <div className="flex justify-between items-center pt-2 border-t border-neutral-200 dark:border-neutral-700">
      <PostLikeButton isLiked={isLiked} likeCount={likeCount} postId={postId} />
      <div className="flex items-center gap-3 text-sm text-neutral-500 dark:text-neutral-400">
        <EyeIcon className="size-4" />
        <span>{views}</span>
        <TimeAgo date={createdAt} />
      </div>
    </div>
  );
}
