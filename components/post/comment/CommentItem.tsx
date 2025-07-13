/**
 * File Name : components/post/comment/CommentItem.tsx
 * Description : 단일 댓글 항목
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2025.07.06  임도헌   Modified  삭제 버튼 onDelete 적용
 * 2025.07.06  임도헌   Modified  삭제 애니메이션 추가 (파도에 쓸려감)
 */
"use client";

import { motion } from "framer-motion";
import CommentDeleteButton from "./CommentDeleteButton";
import UserAvatar from "@/components/common/UserAvatar";
import TimeAgo from "@/components/common/TimeAgo";
import { PostComment } from "@/types/post";

interface CommentItemProps {
  comment: PostComment;
  currentUser: {
    id: number;
    username: string;
  };
}

export default function CommentItem({
  comment,
  currentUser,
}: CommentItemProps) {
  const isOwner = comment.user.username === currentUser.username;

  return (
    <motion.div
      layout
      initial={{ x: -200, opacity: 0 }} // 멀리서 시작
      animate={{
        x: 0,
        opacity: 1,
        transition: {
          type: "tween",
          ease: [0.25, 1, 0.5, 1], // ease-out cubic bezier (파도 느낌)
          duration: 0.6,
        },
      }}
      exit={{
        x: 200,
        opacity: 0,
        transition: {
          ease: [0.4, 0, 1, 1], // ease-in cubic bezier (쓸려감 느낌)
          duration: 0.4,
        },
      }}
      className="flex gap-3 py-4 border-b border-neutral-200 dark:border-neutral-700"
    >
      <UserAvatar
        avatar={comment.user.avatar}
        username={comment.user.username}
        showUsername={false}
        size="sm"
      />
      <div className="flex-1">
        <div className="flex justify-between items-center">
          <span className="font-semibold text-neutral-900 dark:text-neutral-100">
            {comment.user.username}
          </span>
          {isOwner && <CommentDeleteButton commentId={comment.id} />}
        </div>

        <p className="mt-2 text-neutral-800 dark:text-neutral-300 leading-relaxed max-w-[90%] break-words">
          {comment.payload}
        </p>

        <div className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          <TimeAgo date={comment.created_at.toString()} />
        </div>
      </div>
    </motion.div>
  );
}
