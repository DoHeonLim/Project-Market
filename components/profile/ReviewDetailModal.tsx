/**
File Name : components/profile/ReviewDetailModal
Description : 리뷰 상세 모달 컴포넌트(구매자, 판매자)
Author : 임도헌

History
Date        Author   Status    Description
2024.12.03  임도헌   Created
2024.12.03  임도헌   Modified  리뷰 상세 모달 컴포넌트 추가
2024.12.29  임도헌   Modified  리뷰 상세 모달 스타일 수정
*/

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
  onDelete?: () => void;
  emptyMessage?: string;
}

export default function ReviewDetailModal({
  isOpen,
  onClose,
  title,
  review,
  onDelete,
  emptyMessage,
}: ReviewDetailModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-white dark:bg-neutral-800 w-full max-w-md rounded-xl shadow-xl animate-fade-in mx-4">
        {/* 헤더 */}
        <div className="px-6 py-4 border-b dark:border-neutral-700">
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-semibold text-primary dark:text-primary-light">
              {title}
            </h3>
            {review && (
              <div className="flex gap-1">
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

        {/* 본문 */}
        <div className="px-6 py-4">
          {review ? (
            <p className="text-neutral-700 dark:text-neutral-200">
              {review.payload}
            </p>
          ) : (
            <span className="text-neutral-500 dark:text-neutral-400">
              {emptyMessage}
            </span>
          )}
        </div>

        {/* 푸터 */}
        <div className="px-6 py-4 border-t dark:border-neutral-700 flex justify-end space-x-2">
          {review && onDelete && (
            <button
              onClick={onDelete}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 
                dark:bg-red-600 dark:hover:bg-red-500 
                text-white rounded-lg transition-colors"
            >
              삭제
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
