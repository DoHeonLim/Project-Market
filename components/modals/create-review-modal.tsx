/**
File Name : components/modals/create-review-modal
Description : 리뷰 작성 모달 컴포넌트
Author : 임도헌

History
Date        Author   Status    Description
2024.12.03  임도헌   Created
2024.12.03  임도헌   Modified  리뷰 작성 모달 컴포넌트 추가
2024.12.07  임도헌   Modified  프로필 이미지 컴포넌트 분리
2024.12.22  임도헌   Modified  리뷰 로딩 추가, 폼 제출 후 초기화
*/

import { StarIcon } from "@heroicons/react/24/solid";
import { useState } from "react";
import UserAvatar from "../user-avatar";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="p-6 rounded-lg bg-neutral-600 w-96">
        <h2 className="mb-4 text-xl font-bold">거래 후기 작성</h2>
        <UserAvatar
          avatar={userAvatar}
          username={username}
          size="sm"
          disabled={true}
          text="님과의 거래는 어떠셨나요?"
        />

        <div className="flex justify-center mb-4">
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
                    : "text-gray-300"
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
          className="w-full h-32 p-2 mb-4 text-black rounded-md hover:border-2 hover:border-indigo-500"
        />

        <div className="flex justify-between">
          <button
            onClick={handleClose}
            className="px-4 py-2 transition-colors rounded-md bg-rose-500 hover:bg-rose-600"
          >
            취소
          </button>
          <button
            onClick={() => {
              handleSubmit();
              handleClose();
            }}
            disabled={rating === 0 || reviewText.trim() === "" || isSubmitting}
            className="px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-400 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "작성 중..." : "후기 제출"}
          </button>
        </div>
      </div>
    </div>
  );
}
