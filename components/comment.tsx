/**
File Name : components/comment
Description : 댓글 컴포넌트
Author : 임도헌

History
Date        Author   Status    Description
2024.11.06  임도헌   Created
2024.11.06  임도헌   Modified  댓글 컴포넌트 추가
2024.11.06  임도헌   Modified  useOptimistic을 사용하여 낙관적 업데이트 추가
*/
"use client";

import { useOptimistic } from "react";
import CommentForm from "./comments-form";
import CommentsList from "./comments-list";

// 댓글은 없을수도 있으므로 선택적으로 정의
export interface ICommentProps {
  postId: number;
  comments?: ICommentsProps[];
  user: {
    id: number;
    username: string;
    avatar: string | null;
  };
}

// 각각의 댓글 인터페이스 정의
export interface ICommentsProps {
  id: number;
  created_at: Date;
  userId: number;
  user: {
    username: string;
    avatar: string | null;
  };
  payload: string;
}

export default function Comment({
  postId,
  comments = [],
  user,
}: ICommentProps) {
  // Action 타입 정의
  type AddCommentAction = {
    type: "add";
    data: ICommentsProps; // 새로운 댓글 타입
  };

  type DeleteCommentAction = {
    type: "delete";
    data: number; // 댓글 ID 타입
  };

  type Action = AddCommentAction | DeleteCommentAction;
  const [optimisticComments, updateOptimisticComments] = useOptimistic(
    comments,
    (state: ICommentsProps[], action: Action) => {
      if (action.type === "add") {
        const updatedComments = [action.data, ...state];
        return updatedComments.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      } else if (action.type === "delete") {
        const updatedComments = state.filter(
          (comment) => comment.id !== action.data
        );
        return updatedComments.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      }
      return state;
    }
  );

  const addOptimisticComment = (comment: ICommentsProps) => {
    updateOptimisticComments({ type: "add", data: comment });
  };

  const deleteOptimisticComment = (commentId: number) => {
    updateOptimisticComments({ type: "delete", data: commentId });
  };

  return (
    <>
      <CommentForm
        postId={postId}
        addOptimisticComment={addOptimisticComment}
        user={user}
      />
      {optimisticComments?.length !== 0 ? (
        <CommentsList
          comments={optimisticComments}
          postId={postId}
          deleteOptimisticComment={deleteOptimisticComment}
          user={user}
        />
      ) : (
        <div className="mt-4 ml-1">댓글이 없습니다.</div>
      )}
    </>
  );
}
