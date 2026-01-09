/**
 * File Name : components/profile/ReviewsList
 * Description : 유저 리뷰 리스트 컴포넌트 (created_at 전달)
 * Author : 임도헌
 *
 * History
 * Date        Author   Status     Description
 * 2024.12.06  임도헌   Created
 * 2024.12.06  임도헌   Modified  유저 리뷰 리스트 컴포넌트 추가
 * 2025.10.05  임도헌   Modified  created_at 전달 추가 (Item에서 날짜 표기)
 */

"use client";

import type { ProfileReview } from "@/types/profile";
import ReviewItem from "./ReviewsItem";

interface IReviewsListProps {
  reviews: ProfileReview[];
}

export default function ReviewsList({ reviews }: IReviewsListProps) {
  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <ReviewItem key={review.id} review={review} />
      ))}
    </div>
  );
}
