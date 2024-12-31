/**
File Name : components/modals/profile-reviews-modal
Description : 유저 리뷰 모달 컴포넌트
Author : 임도헌

History
Date        Author   Status    Description
2024.12.07  임도헌   Created
2024.12.07  임도헌   Modified  유저 리뷰 모달 컴포넌트 추가
2024.12.08  임도헌   Modified  threshold 값 변경(보이는 영역 50%)
2024.12.29  임도헌   Modified  유저 리뷰 모달 스타일 수정
2024.12.29  임도헌   Modified  리뷰가 없을 때 메시지 추가
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
        className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="relative w-full max-w-xl bg-white dark:bg-neutral-800 rounded-xl shadow-xl animate-fade-in">
          <div className="px-4 sm:px-6 py-4 border-b dark:border-neutral-700">
            <h3 className="text-lg sm:text-xl font-semibold text-center text-primary dark:text-primary-light">
              받은 거래 후기
            </h3>
          </div>

          <div className="px-4 sm:px-6 py-4 max-h-[50vh] sm:max-h-[70vh] overflow-y-auto scrollbar">
            {reviews.length === 0 ? (
              <div className="flex justify-center items-center min-h-[200px]">
                <span className="text-neutral-500 dark:text-white">
                  리뷰가 없습니다.
                </span>
              </div>
            ) : (
              <div className="space-y-4">
                <ReviewsList reviews={reviews} />
                {!isLastPage && (
                  <div className="flex justify-center mt-6">
                    <span
                      ref={trigger}
                      className="inline-flex items-center justify-center h-10 px-4 text-sm font-medium text-neutral-700 dark:text-neutral-200 bg-neutral-100 dark:bg-neutral-700 rounded-lg transition-colors"
                    >
                      {isLoading ? "로딩중..." : "더 보기"}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="px-4 sm:px-6 py-4 border-t dark:border-neutral-700 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm sm:text-base font-semibold bg-rose-500 hover:bg-rose-600 dark:bg-rose-700 dark:hover:bg-rose-600 text-white rounded-lg transition-colors"
            >
              닫기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
