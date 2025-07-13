/**
 * File Name : components/post/comment/CommentContext
 * Description : 댓글 상태 관리 Context
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2025.07.11  임도헌   Created   댓글 상태 Context 및 Provider 구현
 */
"use client";

import { createContext, useContext } from "react";
import { PostComment } from "@/types/post";

interface CommentContextProps {
  comments: PostComment[];
  isLoading: boolean;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  loadMore: () => Promise<void>;
  createComment: (formData: FormData) => Promise<void>;
  deleteComment: (commentId: number) => Promise<void>;
}

const CommentContext = createContext<CommentContextProps | undefined>(
  undefined
);

export function useComment() {
  const context = useContext(CommentContext);
  if (!context) {
    throw new Error("useComment는 CommentProvider 내부에서만 사용해야 합니다.");
  }
  return context;
}

export default CommentContext;
