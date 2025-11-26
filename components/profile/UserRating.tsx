/**
 * File Name : components/profile/UserRating
 * Description : 유저 평점 컴포넌트 (부분 별 렌더링 지원)
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2024.12.06  임도헌   Created
 * 2024.12.06  임도헌   Modified  유저 평점 컴포넌트 추가
 * 2024.12.07  임도헌   Modified  평점 및 갯수 조건 추가
 * 2024.12.12  임도헌   Modified  리뷰가 없을 경우 0으로 나오게 수정
 * 2025.10.29  임도헌   Modified  부분 별(소수점) 렌더링 도입, 0~5 클램프, 텍스트 1자리 고정, a11y 강화
 */
"use client";

import { StarIcon } from "@heroicons/react/24/solid";

interface UserRatingProps {
  average?: number;
  totalReviews?: number;
  size?: "sm" | "md" | "lg";
}

export default function UserRating({
  average,
  totalReviews,
  size = "md",
}: UserRatingProps) {
  // 안전 가드 + 소수점 1자리 표시
  const avg = Math.min(5, Math.max(0, Number(average ?? 0)));
  const displayAvg = (Math.round(avg * 10) / 10).toFixed(1);
  const reviews = Number(totalReviews ?? 0);

  const starSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  } as const;

  const textSizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  } as const;

  // i번째 별의 채움 비율(0~1)
  const fillFor = (i: number) => {
    const v = avg - i; // 0-based
    if (v >= 1) return 1;
    if (v <= 0) return 0;
    return v; // 0~1 사이 → 부분 별
  };

  return (
    <div
      className="flex items-center gap-2"
      role="img"
      aria-label={`평점 ${displayAvg}점, 후기 ${reviews}개`}
    >
      <div className="flex gap-0.5">
        {[0, 1, 2, 3, 4].map((i) => {
          const pct = Math.round(fillFor(i) * 100);
          return (
            <div
              key={i}
              className={`relative ${starSizes[size]} inline-block`}
              aria-hidden="true"
            >
              {/* 바탕(빈 별) */}
              <StarIcon
                className={`absolute inset-0 ${starSizes[size]} text-gray-300`}
              />
              {/* 채움(노란 별) - 가로 클리핑 */}
              <div
                className="absolute inset-0 overflow-hidden"
                style={{ width: `${pct}%` }}
              >
                <StarIcon className={`${starSizes[size]} text-yellow-500`} />
              </div>
            </div>
          );
        })}
      </div>
      <div className={`${textSizes[size]} text-neutral-600 dark:text-gray-300`}>
        {displayAvg} ({reviews})
      </div>
    </div>
  );
}
