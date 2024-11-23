/**
File Name : components/comment-list
Description : 댓글 목록 컴포넌트
Author : 임도헌

History
Date        Author   Status    Description
2024.11.06  임도헌   Created
2024.11.06  임도헌   Modified  댓글 목록 컴포넌트 추가
2024.11.06  임도헌   Modified  useOptimistic기능으로 댓글 삭제 구현
2024.11.12  임도헌   Modified  프로필 이미지 없을 경우의 코드 추가
2024.11.23  임도헌   Modified  시간이 서버에서 미리 렌더링된 HTML과 클라이언트에서 렌더링된 HTML이 일치하지 않는 문제
                               때문에 생긴 오류를 수정해서 일치시키게 변경
*/
"use client";

import { deleteComment } from "@/app/posts/[id]/actions";
import { formatToTimeAgo } from "@/lib/utils";
import Image from "next/image";
import DeleteButton from "./comment-delete-button";
import { UserIcon } from "@heroicons/react/24/solid";
import { useEffect, useState } from "react";

interface ICommentsProps {
  id: number;
  created_at: Date;
  userId: number;
  user: {
    username: string;
    avatar: string | null;
  };
  payload: string;
}

export default function CommentsList({
  comments,
  postId,
  deleteOptimisticComment,
  user,
}: {
  comments: ICommentsProps[];
  postId: number;
  deleteOptimisticComment: (commentId: number) => void;
  user: {
    id: number;
  };
}) {
  const [timesAgo, setTimeAgo] = useState<string[]>([]);

  useEffect(() => {
    const updatedTimesAgo = comments.map((comment) =>
      formatToTimeAgo(comment.created_at.toString())
    );
    setTimeAgo(updatedTimesAgo);
  }, [comments]);

  return (
    <div className="flex flex-col gap-4 mt-4">
      {comments.map((comment, idx) => (
        <div
          key={comment.id}
          className="flex gap-4 pb-5 border-b border-neutral-500 last:pb-0 last:border-b-0"
        >
          <div className="flex justify-center items-center">
            {comment.user.avatar !== null ? (
              <Image
                width={28}
                height={28}
                className="rounded-md size-7"
                src={comment.user.avatar!}
                alt={comment.user.username}
              />
            ) : (
              <UserIcon aria-label="user_icon" className="size-7 rounded-md" />
            )}
          </div>
          <div className="flex flex-col gap-1 flex-1">
            <div className="flex flex-row gap-4 items-center">
              <span className="font-semibold">{comment.user.username}</span>
              <span className="text-sm text-neutral-400">{timesAgo[idx]}</span>
            </div>
            <div className="flex">
              <span className="">{comment.payload}</span>
            </div>
          </div>
          {user.id === comment.userId && (
            <div className="flex items-center ml-auto">
              <DeleteButton
                commentId={comment.id}
                postId={postId}
                onDelete={deleteComment}
                onOptimisticDelete={deleteOptimisticComment}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
