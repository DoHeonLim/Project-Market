/**
File Name : components/post/comment/CommentList
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
2024.12.07  임도헌   Modified  프로필 이미지 컴포넌트 분리
2024.12.12  임도헌   Modified  댓글 생성 시간 표시 변경
2024.12.25  임도헌   Modified  댓글 목록 스타일 변경
*/
"use client";

import { deleteComment } from "@/app/posts/[id]/actions";
import UserAvatar from "../../common/UserAvatar";
import TimeAgo from "../../common/TimeAgo";
import CommentDeleteButton from "./CommentDeleteButton";

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
  return (
    <div className="flex flex-col gap-4 mt-4">
      {comments.map((comment) => (
        <div
          key={comment.id}
          className="flex flex-col pb-5 group 
            bg-neutral-100 dark:bg-neutral-900
            border border-neutral-200 dark:border-neutral-700
            p-4 rounded-lg transition-colors"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserAvatar
                avatar={comment.user.avatar}
                username={comment.user.username}
                size="sm"
              />
            </div>
            <div className="flex items-center gap-2">
              {user.id === comment.userId && (
                <div className="group-hover:opacity-100 transition-all">
                  <CommentDeleteButton
                    commentId={comment.id}
                    postId={postId}
                    onDelete={deleteComment}
                    onOptimisticDelete={deleteOptimisticComment}
                  />
                </div>
              )}
              <TimeAgo date={comment.created_at.toString()} />
            </div>
          </div>
          <p className="text-neutral-700 dark:text-white mt-3 leading-relaxed pl-2">
            {comment.payload}
          </p>
        </div>
      ))}
    </div>
  );
}
