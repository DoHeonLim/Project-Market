/**
 * File Name : components/profile/ReviewDetailModal
 * Description : 리뷰 상세 모달 컴포넌트(구매자, 판매자)
 * Author : 임도헌
 *
 * History
 * 2024.12.03  임도헌   Created
 * 2024.12.29  임도헌   Modified  리뷰 상세 모달 스타일 수정
 * 2025.10.19  임도헌   Modified  onDelete 비동기/로딩 처리 + ESC/오버레이 닫기 + 접근성 보강
 */

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { StarIcon } from "@heroicons/react/24/solid";

interface ReviewDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  review?: {
    id: number;
    rate: number;
    payload: string;
  };

  onDelete?: () => void | Promise<void>;
  emptyMessage?: string;
}

export default function ReviewDetailModal({
  isOpen,
  onClose,
  title,
  review,
  onDelete,
  emptyMessage = "아직 작성된 리뷰가 없습니다.",
}: ReviewDetailModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // ESC로 닫기
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  // 삭제 처리(동기/비동기 대응)
  const handleDelete = useCallback(async () => {
    if (!onDelete) return;
    try {
      setIsDeleting(true);
      await onDelete();
      // 삭제 성공 후 닫기는 호출측에서 해도 되고 여기서 닫아도 됨.
      // 호출측(MySales/MyPurchases)에서 상태 갱신 후 닫도록 유지하는게 깔끔 → 여기서는 닫지 않음.
    } finally {
      setIsDeleting(false);
    }
  }, [onDelete]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      aria-modal="true"
      role="dialog"
      aria-labelledby="review-detail-title"
    >
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Dialog */}
      <div
        ref={dialogRef}
        className="relative bg-white dark:bg-neutral-800 w-full max-w-md rounded-xl shadow-xl animate-fade-in mx-4"
        onClick={(e) => e.stopPropagation()} // 패널 클릭 시 닫힘 방지
      >
        {/* Header */}
        <div className="px-6 py-4 border-b dark:border-neutral-700">
          <div className="flex items-center gap-2">
            <h3
              id="review-detail-title"
              className="text-xl font-semibold text-primary dark:text-primary-light"
            >
              {title}
            </h3>
            {review && (
              <div className="flex gap-1" aria-label={`별점 ${review.rate}점`}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <StarIcon
                    key={star}
                    className={`w-5 h-5 ${
                      star <= review.rate
                        ? "text-yellow-500"
                        : "text-neutral-300 dark:text-neutral-600"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-4">
          {review ? (
            <p className="text-neutral-700 dark:text-neutral-200 whitespace-pre-wrap">
              {review.payload}
            </p>
          ) : (
            <span className="text-neutral-500 dark:text-neutral-400">
              {emptyMessage}
            </span>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t dark:border-neutral-700 flex justify-end space-x-2">
          {review && onDelete && (
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 
                dark:bg-red-600 dark:hover:bg-red-500 
                text-white rounded-lg transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isDeleting ? "삭제 중..." : "삭제"}
            </button>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 
              dark:bg-neutral-700 dark:hover:bg-neutral-600 
              text-neutral-700 dark:text-neutral-200 
              rounded-lg transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
