/**
File Name : components/profile/UserRating
Description : 유저 평점 컴포넌트
Author : 임도헌

History
Date        Author   Status    Description
2024.12.06  임도헌   Created
2024.12.06  임도헌   Modified  유저 평점 컴포넌트 추가
2024.12.07  임도헌   Modified  평점 및 갯수 조건 추가
2024.12.12  임도헌   Modified  리뷰가 없을 경우 0으로 나오게 수정
*/
"use client";

import { StarIcon } from "@heroicons/react/24/solid";

interface UserRatingProps {
  rating?: number;
  totalReviews?: number;
  size?: "sm" | "md" | "lg";
}

export default function UserRating({
  rating,
  totalReviews,
  size = "md",
}: UserRatingProps) {
  const starSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  const textSizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <StarIcon
            key={star}
            className={`
              ${starSizes[size]}
              ${
                rating && star <= rating
                  ? "text-yellow-500"
                  : rating && star - rating <= 0.5
                    ? "text-yellow-300"
                    : "text-gray-300"
              }
            `}
          />
        ))}
      </div>
      <div className={`${textSizes[size]} text-gray-300`}>
        {rating} ({!totalReviews ? "0" : totalReviews})
      </div>
    </div>
  );
}
