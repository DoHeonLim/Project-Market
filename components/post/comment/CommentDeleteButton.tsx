/**
File Name : components/post/comment/CommentDeleteButton
Description : 댓글 삭제 버튼 컴포넌트
Author : 임도헌

History
Date        Author   Status    Description
2024.11.01  임도헌   Created
2024.11.06  임도헌   Modified  댓글 삭제 기능 추가
2024.11.23  임도헌   Modified  삭제 버튼 접근성 추가
2024.11.25  임도헌   Modified  삭제 버튼 디자인 변경
2024.12.25  임도헌   Modified  삭제 버튼 토스트 메시지 추가
2025.05.08  임도헌   Modified  댓글 삭제 모달 추가
2025.07.12  임도헌   Modified  버튼 비활성화 추가, UX 개선
*/
"use client";

import { useState } from "react";
import CommentDeleteModal from "./CommentDeleteModal";
import { TrashIcon } from "@heroicons/react/24/solid";
import { useComment } from "./CommentContext";
import { toast } from "sonner";

export default function CommentDeleteButton({
  commentId,
}: {
  commentId: number;
}) {
  const { deleteComment } = useComment();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteComment(commentId);
      setIsModalOpen(false); // 성공 시 모달 닫기
      toast.success("🗑️ 댓글 삭제 완료");
    } catch (e) {
      console.error(e);
      toast.error("댓글 삭제 중 오류가 발생했습니다.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <button
        disabled={isDeleting}
        aria-label="항해 일지 삭제"
        onClick={() => setIsModalOpen(!isModalOpen)}
        className={`p-1.5 rounded-full text-black dark:text-white
        ${isDeleting ? "opacity-50 cursor-not-allowed" : "hover:text-rose-600 dark:hover:text-rose-500"}
        bg-transparent hover:bg-rose-500/10 transition-all duration-200`}
      >
        <TrashIcon className="size-4" />
      </button>
      <CommentDeleteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(!isModalOpen)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
      />
    </>
  );
}
