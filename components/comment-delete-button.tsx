/**
File Name : components/comment-delete-button
Description : 댓글 삭제 버튼 컴포넌트
Author : 임도헌

History
Date        Author   Status    Description
2024.11.01  임도헌   Created
2024.11.06  임도헌   Modified  댓글 삭제 기능 추가
*/
"use client";

import { TrashIcon } from "@heroicons/react/24/solid";

export interface DeleteResponse {
  success: boolean;
  error?: string;
}

interface IDeleteButtonProps {
  commentId: number;
  postId: number;
  onDelete: (commentId: number, postId: number) => Promise<DeleteResponse>;
  onOptimisticDelete: (commentId: number) => void;
}

export default function DeleteButton({
  commentId,
  postId,
  onDelete,
  onOptimisticDelete,
}: IDeleteButtonProps) {
  const handleDeleteClick = async () => {
    if (confirm("댓글을 삭제하시겠습니까?")) {
      try {
        // 낙관적 업데이트 먼저 적용
        onOptimisticDelete(commentId);
        await onDelete(commentId, postId);
      } catch (e) {
        console.error("댓글 삭제 실패", e);
        alert("댓글 삭제에 실패했습니다.");
      }
    }
  };

  return (
    <button onClick={handleDeleteClick}>
      <TrashIcon className="size-8 text-rose-700 hover:text-rose-500 transition-colors" />
    </button>
  );
}
