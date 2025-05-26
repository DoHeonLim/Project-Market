/**
File Name : components/modals/comment-delete-modal
Description : 댓글 삭제 모달
Author : 임도헌

History
Date        Author   Status    Description
2025.05.08  임도헌   Created
2025.05.08  임도헌   Modified  댓글 삭제 모달 추가
*/
"use client";

import { useState } from "react";
import { toast } from "sonner";
import { DeleteResponse } from "../comment-delete-button";

interface CommentDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDelete: (commentId: number, postId: number) => Promise<DeleteResponse>;
  onOptimisticDelete: (commentId: number) => void;
  commentId: number;
  postId: number;
}

export default function CommentDeleteModal({
  isOpen,
  onClose,
  onDelete,
  onOptimisticDelete,
  commentId,
  postId,
}: CommentDeleteModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      onOptimisticDelete(commentId);
      await onDelete(commentId, postId);
      onClose();
      toast.success("항해 로그가 삭제되었습니다.");
    } catch (error) {
      console.error(error);
      toast.error("항해 로그 삭제에 실패했습니다.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-50 w-full max-w-md p-6 mx-4 bg-white dark:bg-neutral-800 rounded-lg shadow-xl">
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
          항해 로그 삭제
        </h2>
        <p className="text-neutral-600 dark:text-neutral-300 mb-6">
          항해 로그를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 text-sm text-neutral-600 dark:text-neutral-300 hover:text-neutral-800 dark:hover:text-neutral-100 transition-colors disabled:opacity-50"
          >
            취소
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="px-4 py-2 text-sm text-white bg-rose-500 hover:bg-rose-600 rounded-lg transition-colors disabled:opacity-50"
          >
            {isDeleting ? "삭제 중..." : "삭제"}
          </button>
        </div>
      </div>
    </div>
  );
}
