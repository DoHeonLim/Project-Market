/**
 * File Name : components/stream/recordingComment/RecordingCommentDeleteModal
 * Description : 녹화본 댓글 삭제 확인 모달 컴포넌트 (WaveModal 기반)
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2025.08.05  임도헌   Modified  WaveModal 및 tailwind 기반으로 재작성
 */

"use client";

import WaveModal from "@/components/common/WaveModal";

interface RecordingCommentDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
}

export default function RecordingCommentDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
}: RecordingCommentDeleteModalProps) {
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
