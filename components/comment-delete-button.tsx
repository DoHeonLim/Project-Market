/**
File Name : components/comment-delete-button
Description : 댓글 삭제 버튼 컴포넌트
Author : 임도헌

History
Date        Author   Status    Description
2024.11.01  임도헌   Created
2024.11.06  임도헌   Modified  댓글 삭제 기능 추가
2024.11.23  임도헌   Modified  삭제 버튼 접근성 추가
2024.11.25  임도헌   Modified  삭제 버튼 디자인 변경
2024.12.25  임도헌   Modified  삭제 버튼 토스트 메시지 추가
*/
"use client";

import { TrashIcon } from "@heroicons/react/24/outline";
import { toast } from "sonner";

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

export default function CommentDeleteButton({
  commentId,
  postId,
  onDelete,
  onOptimisticDelete,
}: IDeleteButtonProps) {
  const handleDeleteClick = async () => {
    toast.promise(
      async () => {
        if (confirm("항해 일지를 삭제하시겠습니까?")) {
          try {
            onOptimisticDelete(commentId);
            await onDelete(commentId, postId);
          } catch (e) {
            console.error("항해 일지 삭제 실패", e);
            throw new Error("항해 일지 삭제에 실패했습니다.");
          }
        }
      },
      {
        loading: "항해 일지를 삭제하는 중...",
        success: "항해 일지가 삭제되었습니다.",
        error: "항해 일지 삭제에 실패했습니다.",
      }
    );
  };

  return (
    <button
      aria-label="항해 일지 삭제"
      onClick={handleDeleteClick}
      className="p-1.5 rounded-full 
        text-neutral-400 hover:text-rose-500
        bg-transparent hover:bg-rose-500/10
        transition-all duration-200"
    >
      <TrashIcon className="size-4" />
    </button>
  );
}
