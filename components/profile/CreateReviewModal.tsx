/**
 * File Name : components/profile/CreateReviewModal
 * Description : 리뷰 작성 모달 컴포넌트
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2024.12.03  임도헌   Created
 * 2024.12.03  임도헌   Modified  리뷰 작성 모달 컴포넌트 추가
 * 2024.12.07  임도헌   Modified  프로필 이미지 컴포넌트 분리
 * 2024.12.22  임도헌   Modified  리뷰 로딩 추가, 폼 제출 후 초기화
 * 2024.12.29  임도헌   Modified  리뷰 작성 모달 스타일 수정
 * 2025.10.19  임도헌   Modified  제출 성공 시에만 닫기 + 중복클릭 방지 + 폼 리셋
 */

import { StarIcon } from "@heroicons/react/24/solid";
import { useCallback, useEffect, useState } from "react";
import UserAvatar from "../common/UserAvatar";

interface CreateReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (text: string, rating: number) => Promise<boolean> | boolean;
  username: string;
  userAvatar: string | null;
}

export default function CreateReviewModal({
  isOpen,
  onClose,
  onSubmit,
  username,
  userAvatar,
}: CreateReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 모달 닫힐 때 폼 리셋
  const resetForm = useCallback(() => {
    setRating(0);
    setReviewText("");
    setHoverRating(0);
    setIsSubmitting(false);
  }, []);

  useEffect(() => {
    if (!isOpen) resetForm();
  }, [isOpen, resetForm]);

  if (!isOpen) return null;

  const disabled = rating === 0 || reviewText.trim() === "" || isSubmitting;

  const handleBackdrop = () => {
    if (isSubmitting) return; // 제출 중엔 닫기 방지
    onClose();
  };

  const handleSubmit = async () => {
    if (disabled) return;
    try {
      setIsSubmitting(true);
      const ok = await onSubmit(reviewText, rating);
      if (ok) {
        resetForm();
        onClose(); // 성공시에만 닫기
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm"
        onClick={handleBackdrop}
      />

      <div className="relative bg-white dark:bg-neutral-800 w-full max-w-md rounded-xl shadow-xl animate-fade-in mx-4">
        <div className="px-6 py-4 border-b dark:border-neutral-700">
          <h2 className="text-xl font-semibold text-primary dark:text-primary-light">
            거래 후기 작성
          </h2>
        </div>

        <div className="p-6 space-y-6">
          <UserAvatar
            avatar={userAvatar}
            username={username}
            size="sm"
            disabled
            text="님과의 거래는 어떠셨나요?"
          />

          <div className="flex justify-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <StarIcon
                key={star}
                className={`cursor-pointer w-10 h-10 transition-colors duration-200 ${
                  star <= (hoverRating || rating)
                    ? "text-yellow-500"
                    : "text-neutral-300 dark:text-neutral-600"
                } ${!isSubmitting ? "hover:text-yellow-400" : "opacity-60 cursor-not-allowed"}`}
                onMouseEnter={() => !isSubmitting && setHoverRating(star)}
                onMouseLeave={() => !isSubmitting && setHoverRating(0)}
                onClick={() => !isSubmitting && setRating(star)}
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
            disabled={isSubmitting}
          />
        </div>

        <div className="px-6 py-4 border-t dark:border-neutral-700 flex justify-end space-x-2">
          <button
            onClick={handleBackdrop}
            disabled={isSubmitting}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 
                dark:bg-red-600 dark:hover:bg-red-500 
              text-white rounded-lg transition-colors disabled:opacity-60"
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            disabled={disabled}
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
