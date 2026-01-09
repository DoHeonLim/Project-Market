/**
 * File Name : components/stream/recordingComment/RecordingCommentDeleteButton
 * Description : 녹화본 댓글 삭제 버튼 컴포넌트
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2024.11.19  임도헌   Created
 * 2024.11.19  임도헌   Modified  스트리밍 삭제 버튼 추가
 * 2025.05.16  임도헌   Modified  status props 추가
 * 2025.07.31  임도헌   Modified  DeleteResponse 추가
 * 2025.08.05  임도헌   Modified  Post 방식에 맞춰 토스트/아이콘/모달 삭제 처리
 * 2025.08.23  임도헌   Modified  상태 비교를 CONNECTED로 통일(소문자 불일치 수정)
 * 2025.09.09  임도헌   Move      StreamDeleteButton에서 RecordingCommentDeleteButton으로 이동동
 * 2025.09.09  임도헌   Modified  ConfirmDialog/sonner 적용, 중복 클릭 방지, a11y 보강
 */

"use client";

import { useState } from "react";
import { useRecordingCommentContext } from "./RecordingCommentContext";
import RecordingCommentDeleteModal from "./RecordingCommentDeleteModal";
import { TrashIcon } from "@heroicons/react/24/solid";

export default function RecordingCommentDeleteButton({
  commentId,
}: {
  commentId: number;
}) {
  const { deleteComment } = useRecordingCommentContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteComment(commentId);
      setIsModalOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <button
        disabled={isDeleting}
        aria-label="댓글 삭제"
        onClick={() => setIsModalOpen(true)}
        className={`p-1.5 rounded-full text-black dark:text-white
          ${isDeleting ? "opacity-50 cursor-not-allowed" : "hover:text-rose-600 dark:hover:text-rose-500"}
          bg-transparent hover:bg-rose-500/10 transition-all duration-200`}
      >
        <TrashIcon className="size-4" />
      </button>
      <RecordingCommentDeleteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
      />
    </>
  );
}
