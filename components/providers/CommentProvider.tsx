/**
 * File Name : components/post/comment/CommentProvider
 * Description : 댓글 상태 관리 Provider
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2025.07.11  임도헌   Created   댓글 상태 관리 Provider 구현
 */
"use client";

import React from "react";
import CommentContext from "../post/comment/CommentContext";
import { useComment } from "@/hooks/useComment";

interface CommentProviderProps {
  postId: number;
  children: React.ReactNode;
}

export default function CommentProvider({
  postId,
  children,
}: CommentProviderProps) {
  const value = useComment(postId);

  return (
    <CommentContext.Provider value={value}>{children}</CommentContext.Provider>
  );
}
