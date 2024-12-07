/**
File Name : components/reviews-item
Description : 유저 리뷰 컴포넌트
Author : 임도헌

History
Date        Author   Status    Description
2024.12.06  임도헌   Created
2024.12.06  임도헌   Modified  유저 리뷰 컴포넌트 추가
*/
import { UserIcon } from "@heroicons/react/24/solid";
import Image from "next/image";

interface IReviewItemProps {
  review: {
    id: number;
    userId: number;
    productId: number;
    payload: string;
    rate: number;
    user: {
      username: string;
      avatar: string | null;
    };
  };
}

export default function ReviewItem({ review }: IReviewItemProps) {
  return (
    <div className="border-b pb-4 mb-4">
      <div className="flex items-center space-x-4">
        <div className="flex items-center gap-3 p-5">
          <div className="overflow-hidden rounded-full size-10">
            {review.user.avatar !== null ? (
              <Image
                width={40}
                height={40}
                src={`${review.user.avatar!}/avatar`}
                alt={review.user.username}
              />
            ) : (
              <UserIcon aria-label="user_icon" />
            )}
          </div>
        </div>
        <div>
          <h4 className="font-bold">{review.user.username}</h4>
          <div className="flex items-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <svg
                key={star}
                className={`w-5 h-5 ${
                  review.rate >= star ? "text-yellow-400" : "text-gray-300"
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
        </div>
        <p>{review.payload}</p>
      </div>
    </div>
  );
}
