/**
File Name : components/modals/create-review-modal
Description : 리뷰 작성 모달 컴포넌트
Author : 임도헌

History
Date        Author   Status    Description
2024.12.03  임도헌   Created
2024.12.03  임도헌   Modified  리뷰 작성 모달 컴포넌트 추가
*/

import { StarIcon, UserIcon } from "@heroicons/react/24/solid";
import Image from "next/image";
import { useState } from "react";

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="p-6 rounded-lg bg-neutral-600 w-96">
        <h2 className="mb-4 text-xl font-bold">거래 후기 작성</h2>
        <div className="flex items-center gap-2 mb-2">
          {userAvatar !== null ? (
            <Image
              width={28}
              height={28}
              className="rounded-md size-7"
              src={`${userAvatar}/avatar`}
              alt={username}
            />
          ) : (
            <UserIcon aria-label="user_icon" className="rounded-md size-7" />
          )}
          <span className="text-sm font-semibold">
            {username} 님과의 거래는 어떠셨나요?
          </span>
        </div>

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
            onClick={() => {
              onClose();
              setRating(0);
              setReviewText("");
            }}
            className="px-4 py-2 transition-colors rounded-md bg-rose-500 hover:bg-rose-600"
          >
            취소
          </button>
          <button
            onClick={() => onSubmit(reviewText, rating)}
            disabled={rating === 0 || reviewText.trim() === ""}
            className="px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-400 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            후기 제출
          </button>
        </div>
      </div>
    </div>
  );
}
