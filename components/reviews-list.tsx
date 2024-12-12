/**
File Name : components/reviews-list
Description : 유저 리뷰 리스트 컴포넌트
Author : 임도헌

History
Date        Author   Status    Description
2024.12.06  임도헌   Created
2024.12.06  임도헌   Modified  유저 리뷰 리스트 컴포넌트 추가
*/
import ReviewItem from "./reviews-ltem";

interface IReviewsListProps {
  reviews: {
    id: number;
    userId: number;
    productId: number;
    payload: string;
    rate: number;
    user: {
      username: string;
      avatar: string | null;
    };
  }[];
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
