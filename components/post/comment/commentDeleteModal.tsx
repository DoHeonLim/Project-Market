/**
File Name : components/post/comment/commentDeleteModal
Description : 댓글 삭제 모달
Author : 임도헌

History
Date        Author   Status    Description
2025.05.08  임도헌   Created
2025.05.08  임도헌   Modified  댓글 삭제 모달 추가
2025.07.06  임도헌   Modified  UI 개선 및 통일
2025.07.06  임도헌   Modified  wave모달 적용
2025.07.12  임도헌   Modified  로딩 상태 추가
*/
"use client";

import WaveModal from "@/components/common/WaveModal";

interface CommentDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
}

export default function CommentDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
}: CommentDeleteModalProps) {
  return (
    <WaveModal isOpen={isOpen} onClose={onClose}>
      <h2 className="text-lg font-semibold text-neutral-800 dark:text-neutral-100">
        댓글 삭제
      </h2>
      <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">
        이 댓글을 정말 삭제하시겠습니까? 복구할 수 없습니다.
      </p>
      <div className="flex justify-end gap-2 mt-6">
        <button
          onClick={onClose}
          className="px-4 py-2 rounded-md bg-neutral-300 dark:bg-neutral-700 text-neutral-800 dark:text-white hover:bg-neutral-400 dark:hover:bg-neutral-600 transition-colors"
        >
          취소
        </button>
        <button
          onClick={onConfirm}
          disabled={isLoading}
          className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors"
        >
          {isLoading ? "삭제 중..." : "삭제"}
        </button>
      </div>
    </WaveModal>
  );
}
