/**
File Name : components/modals/profile-reviews-modal
Description : 유저 리뷰 모달 컴포넌트
Author : 임도헌

History
Date        Author   Status    Description
2024.12.07  임도헌   Created
2024.12.07  임도헌   Modified  유저 리뷰 모달 컴포넌트 추가
2024.12.08  임도헌   Modified  threshold 값 변경(보이는 영역 50%)
*/

"use client";

import { useEffect, useRef, useState } from "react";

import { getMoreUserReviews } from "@/app/(tabs)/profile/actions";
import ReviewsList from "../reviews-list";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
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
  userId: number;
}

export default function ReviewModal({
  isOpen,
  onClose,
  reviews: initialReviews,
  userId,
}: ReviewModalProps) {
  const [reviews, setReviews] = useState(initialReviews);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [isLastPage, setIsLastPage] = useState(false);
  const trigger = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const observer = new IntersectionObserver(
      async (
        entries: IntersectionObserverEntry[],
        observer: IntersectionObserver
      ) => {
        const element = entries[0];
        if (element.isIntersecting && trigger.current) {
          observer.unobserve(trigger.current);
          setIsLoading(true);

          const newReviews = await getMoreUserReviews(page + 1, userId);
          if (newReviews.length !== 0) {
            setReviews((prev) => [...prev, ...newReviews]);
            setPage((prev) => prev + 1);
            setIsLoading(false);
          } else {
            setIsLastPage(true);
          }
        }
      },
      {
        threshold: 0.5,
      }
    );

    if (trigger.current) {
      observer.observe(trigger.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [page, userId, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-black bg-opacity-30 transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="relative dark:bg-neutral-800 bg-white w-full max-w-2xl rounded-lg shadow-xl">
          <div className="px-6 py-4">
            <h3 className="text-xl font-semibold text-center dark:text-white">
              받은 거래 후기
            </h3>
          </div>

          <div className="px-6 py-4 max-h-[70vh] overflow-y-auto dark:text-white">
            <ReviewsList reviews={reviews} />
            {!isLastPage ? (
              <div className="flex justify-center">
                <span
                  ref={trigger}
                  className="mt-10 text-sm font-semibold bg-indigo-500 text-white w-fit mx-auto px-3 py-2 rounded-md hover:opacity-90 active:scale-95"
                >
                  {isLoading ? "로딩중" : "더 가져오기"}
                </span>
              </div>
            ) : null}
          </div>

          <div className="px-6 py-4 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 dark:bg-neutral-700 dark:text-white bg-gray-200 text-gray-800 rounded-md hover:opacity-90 transition-colors"
            >
              닫기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
