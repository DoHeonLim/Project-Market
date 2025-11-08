/**
 * File Name : components/profile/ReviewsItem
 * Description : 유저 리뷰 컴포넌트 (작성일 표기 + payload/content 호환)
 * Author : 임도헌
 *
 * History
 * Date        Author   Status     Description
 * 2024.12.06  임도헌   Created
 * 2024.12.06  임도헌   Modified  유저 리뷰 컴포넌트 추가
 * 2024.12.07  임도헌   Modified  프로필 이미지 컴포넌트 분리
 * 2024.12.29  임도헌   Modified  리뷰 컴포넌트 스타일 수정
 * 2025.10.05  임도헌   Modified  created_at 표기 + payload/content 호환
 * 2025.10.29  임도헌   Modified  TimeAgo 컴포넌트로 날짜 표기 일원화(자동 갱신/툴팁)
 */

"use client";

import type { ProfileReview } from "@/types/profile";
import UserAvatar from "../common/UserAvatar";
import TimeAgo from "../common/TimeAgo";

interface IReviewItemProps {
  review: ProfileReview;
}

export default function ReviewItem({ review }: IReviewItemProps) {
  const text = review.payload ?? "";

  return (
    <div className="border-b dark:border-neutral-700 pb-4 mb-4 last:border-b-0 last:mb-0 last:pb-0">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* 유저 정보 섹션 */}
        <div className="flex items-center gap-3 min-w-0">
          <UserAvatar
            avatar={review.user?.avatar}
            username={review.user?.username || ""}
            size="md"
          />
          {/* 별점 + 작성일 */}
          <div className="flex items-center gap-2 min-w-0">
            <div
              className="flex items-center gap-1"
              aria-label={`평점 ${review.rate}점`}
            >
              {[1, 2, 3, 4, 5].map((star) => (
                <svg
                  key={star}
                  className={`w-4 h-4 sm:w-5 sm:h-5 ${
                    review.rate >= star
                      ? "text-yellow-400"
                      : "text-gray-300 dark:text-neutral-600"
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <TimeAgo date={review.created_at} />
          </div>
        </div>

        {/* 리뷰 내용 섹션 */}
        <div className="flex-1 space-y-2 flex items-center sm:justify-start pl-2 sm:pl-0">
          <p
            className="text-sm sm:text-base text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap break-words"
            title={text || undefined}
          >
            {text || "내용 없음"}
          </p>
        </div>
      </div>
    </div>
  );
}
