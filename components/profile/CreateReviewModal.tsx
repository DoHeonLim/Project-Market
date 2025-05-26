/**
File Name : components/profile/CreateReviewModal
Description : 리뷰 작성 모달 컴포넌트
Author : 임도헌

History
Date        Author   Status    Description
2024.12.03  임도헌   Created
2024.12.03  임도헌   Modified  리뷰 작성 모달 컴포넌트 추가
2024.12.07  임도헌   Modified  프로필 이미지 컴포넌트 분리
2024.12.22  임도헌   Modified  리뷰 로딩 추가, 폼 제출 후 초기화
2024.12.29  임도헌   Modified  리뷰 작성 모달 스타일 수정
*/

import { StarIcon } from "@heroicons/react/24/solid";
import { useState } from "react";
import UserAvatar from "../common/UserAvatar";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (text: string, rating: number) => void;
  username: string;
  userAvatar: string | null;
}

export default function ReviewModal({
  isOpen,
  onClose,
  onSubmit,
  username,
  userAvatar,
}: ReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setRating(0);
    setReviewText("");
    setHoverRating(0);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    onSubmit(reviewText, rating);
    setIsSubmitting(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm"
        onClick={handleClose}
      />

      <div className="relative bg-white dark:bg-neutral-800 w-full max-w-md rounded-xl shadow-xl animate-fade-in mx-4">
        {/* 헤더 */}
        <div className="px-6 py-4 border-b dark:border-neutral-700">
          <h2 className="text-xl font-semibold text-primary dark:text-primary-light">
            거래 후기 작성
          </h2>
        </div>

        {/* 본문 */}
        <div className="p-6 space-y-6">
          <UserAvatar
            avatar={userAvatar}
            username={username}
            size="sm"
            disabled={true}
            text="님과의 거래는 어떠셨나요?"
          />

          <div className="flex justify-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <StarIcon
                key={star}
                className={`
                  cursor-pointer
                  w-10 h-10
                  transition-colors duration-200
                  ${
                    star <= (hoverRating || rating)
                      ? "text-yellow-500"
                      : "text-neutral-300 dark:text-neutral-600"
                  }
                  hover:text-yellow-400
                `}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
              />
            ))}
          </div>

          <textarea
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            placeholder="거래 경험은 어떠셨나요?"
            className="w-full h-32 p-3 rounded-lg bg-neutral-50 dark:bg-neutral-700 
              border border-neutral-200 dark:border-neutral-600
              focus:ring-2 focus:ring-primary-light dark:focus:ring-primary
              text-neutral-900 dark:text-white
              placeholder-neutral-400 dark:placeholder-neutral-500"
          />
        </div>

        {/* 푸터 */}
        <div className="px-6 py-4 border-t dark:border-neutral-700 flex justify-end space-x-2">
          <button
            onClick={handleClose}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 
                dark:bg-red-600 dark:hover:bg-red-500 
              text-white
              rounded-lg transition-colors"
          >
            취소
          </button>
          <button
            onClick={() => {
              handleSubmit();
              handleClose();
            }}
            disabled={rating === 0 || reviewText.trim() === "" || isSubmitting}
            className="px-4 py-2 bg-primary hover:bg-primary-dark 
              dark:bg-primary-light dark:hover:bg-primary
              text-white rounded-lg transition-colors
              disabled:bg-neutral-300 dark:disabled:bg-neutral-600 
              disabled:text-neutral-500 dark:disabled:text-neutral-400 
              disabled:cursor-not-allowed"
          >
            {isSubmitting ? "작성 중..." : "후기 제출"}
          </button>
        </div>
      </div>
    </div>
  );
}
