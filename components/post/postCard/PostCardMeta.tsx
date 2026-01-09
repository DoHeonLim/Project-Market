/**
 * File Name : components/post/PostCard/PostCardMeta
 * Description : 게시글 메타데이터 (조회수, 좋아요, 댓글, 시간)
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2025.07.04  임도헌   Created
 */
"use client";

import {
  EyeIcon,
  HeartIcon,
  ChatBubbleLeftIcon,
} from "@heroicons/react/24/solid";
import TimeAgo from "@/components/common/TimeAgo";
interface PostCardMetaProps {
  views: number;
  likes: number;
  comments: number;
  createdAt: string;
}

export default function PostCardMeta({
  views,
  likes,
  comments,
  createdAt,
}: PostCardMetaProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
      <EyeIcon className="size-3 sm:size-4" />
      <span>{views}</span>
      <HeartIcon className="size-3 sm:size-4 text-rose-600" />
      <span>{likes}</span>
      <ChatBubbleLeftIcon className="w-4 h-4" />
      {comments}
      <TimeAgo date={createdAt} />
    </div>
  );
}
