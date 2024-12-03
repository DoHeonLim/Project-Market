/**
File Name : components/modals/review-detail-modal
Description : 리뷰 상세 모달 컴포넌트(구매자, 판매자)
Author : 임도헌

History
Date        Author   Status    Description
2024.12.03  임도헌   Created
2024.12.03  임도헌   Modified  리뷰 상세 모달 컴포넌트 추가
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="flex flex-col gap-4 p-6 rounded-lg bg-neutral-600 w-96">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">{title}</h3>
          {review && (
            <div className="flex gap-2 mb-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <StarIcon
                  key={star}
                  className={`w-5 h-5 ${
                    star <= review.rate ? "text-yellow-500" : "text-gray-300"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
        {review ? (
          <p className="text-sm">{review.payload}</p>
        ) : (
          <span className="text-sm">{emptyMessage}</span>
        )}
        <div className="flex justify-end gap-2">
          {review && onDelete && (
            <button
              onClick={onDelete}
              className="px-4 py-2 transition-colors bg-red-500 rounded-md hover:bg-red-600"
            >
              삭제
            </button>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 transition-colors rounded-md bg-rose-500 hover:bg-rose-600"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
