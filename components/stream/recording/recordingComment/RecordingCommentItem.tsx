/**
 * File Name : components/stream/recordingComment/RecordingCommentItem
 * Description : 녹화본 단일 댓글 아이템
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2025.08.04  임도헌   Created   댓글 아이템 렌더링 및 삭제 기능 추가
 * 2025.08.05  임도헌   Modified  삭제 로직 props 전달 방식으로 변경
 * 2025.08.05  임도헌   Modified  RecordingCommentDeleteButton 적용
 */
"use client";

import { motion } from "framer-motion";
import RecordingCommentDeleteButton from "@/components/stream/recording/recordingComment/RecordingCommentDeleteButton";
import UserAvatar from "@/components/common/UserAvatar";
import TimeAgo from "@/components/common/TimeAgo";
import { StreamComment } from "@/types/stream";

interface RecordingCommentItemProps {
  comment: StreamComment;
  currentUserId: number;
}

export default function RecordingCommentItem({
  comment,
  currentUserId,
}: RecordingCommentItemProps) {
  const isOwner = comment.user.id === currentUserId;

  return (
    <motion.div
      layout
      initial={{ x: -200, opacity: 0 }}
      animate={{
        x: 0,
        opacity: 1,
        transition: { type: "tween", ease: [0.25, 1, 0.5, 1], duration: 0.6 },
      }}
      exit={{
        x: 200,
        opacity: 0,
        transition: { ease: [0.4, 0, 1, 1], duration: 0.4 },
      }}
      className="flex items-start gap-3 py-4 border-b border-neutral-200 dark:border-neutral-700"
    >
      <UserAvatar
        avatar={comment.user.avatar}
        username={comment.user.username}
        size="md"
        showUsername={false}
      />

      <div className="flex-1 min-w-0">
        {/* 1행: 작성자 / 시간 / 삭제 */}
        <div className="flex items-center gap-2">
          <span className="font-semibold text-neutral-900 dark:text-neutral-100">
            {comment.user.username}
          </span>
          <span className="text-sm text-neutral-500 dark:text-neutral-400">
            <TimeAgo date={comment.created_at} />
          </span>
          {isOwner && (
            <div className="ml-auto">
              <RecordingCommentDeleteButton commentId={comment.id} />
            </div>
          )}
        </div>

        {/* 2행: 본문 */}
        <p className="mt-2 text-neutral-800 dark:text-neutral-300 leading-relaxed break-words whitespace-pre-line select-text">
          {comment.payload}
        </p>
      </div>
    </motion.div>
  );
}
