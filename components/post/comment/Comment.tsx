/**
File Name : components/post/comment/Comment
Description : 댓글 컴포넌트
Author : 임도헌

History
Date        Author   Status    Description
2024.11.06  임도헌   Created
2024.11.06  임도헌   Modified  댓글 컴포넌트 추가
2024.11.06  임도헌   Modified  useOptimistic을 사용하여 낙관적 업데이트 추가
2025.07.11  임도헌   Modified  낙관적 업데이트 삭제
2025.07.11  임도헌   Modified  CommentProvider 추가해서 prop Drilling 방지
*/
"use client";

import { User } from "@prisma/client";
import CommentForm from "./CommentForm";
import CommentProvider from "@/components/providers/CommentProvider";
import CommentsList from "./CommentsList";

interface CommentProps {
  postId: number;
  user: User;
}

export default function Comment({ postId, user }: CommentProps) {
  return (
    <CommentProvider postId={postId}>
      <div className="mt-4">
        <CommentForm postId={postId} />
        <CommentsList currentUser={user} />
      </div>
    </CommentProvider>
  );
}
