/**
 * File Name : components/profile/ProfileReviewsModal
 * Description : 유저 리뷰 모달 컴포넌트 (키셋 페이지네이션 + created_at 표시 대응)
 * Author : 임도헌
 *
 * History
 * 2024.12.07  임도헌   Created
 * 2024.12.07  임도헌   Modified   유저 리뷰 모달 컴포넌트 추가
 * 2024.12.08  임도헌   Modified   threshold 값 변경(보이는 영역 50%)
 * 2024.12.29  임도헌   Modified   유저 리뷰 모달 스타일 수정
 * 2024.12.29  임도헌   Modified   리뷰가 없을 때 메시지 추가
 * 2025.10.05  임도헌   Modified   getMoreUserReviews({ lastCreatedAt, lastId }) 시그니처 반영 + 옵저버 가드 강화
 * 2025.10.29  임도헌   Modified   ESC 닫기/포커스 복귀/바디 스크롤락/a11y 보강, 옵저버 의존성 안정화
 * 2025.11.13  임도헌   Modified   긴 문장 가독성 개선: 읽기 폭 제한(max-w-2xl/ max-w-prose), overscroll-contain
 */
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ReviewsList from "./ReviewsList";
import { getMoreUserReviews } from "@/lib/user/getUserReviews";
import type { ProfileReview } from "@/types/profile";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  reviews: ProfileReview[];
  userId: number;
}

export default function ProfileReviewsModal({
  isOpen,
  onClose,
  reviews: initialReviews,
  userId,
}: ReviewModalProps) {
  const [reviews, setReviews] = useState<ProfileReview[]>(initialReviews);
  const [isLoading, setIsLoading] = useState(false);
  const [isLastPage, setIsLastPage] = useState(false);

  const dialogRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const restoreFocusEl = useRef<HTMLElement | null>(null);

  const cursor = useMemo(() => {
    const tail = reviews.at(-1);
    if (!tail) return null;
    const created =
      typeof tail.created_at === "string"
        ? new Date(tail.created_at)
        : tail.created_at;
    return { lastCreatedAt: created, lastId: tail.id };
  }, [reviews]);

  useEffect(() => {
    if (!isOpen) return;
    setReviews(initialReviews);
    setIsLastPage(false);
    setIsLoading(false);
  }, [isOpen, initialReviews]);

  // ESC + 포커스 + 바디 스크롤락
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    restoreFocusEl.current = document.activeElement as HTMLElement | null;
    dialogRef.current?.focus();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
      restoreFocusEl.current?.focus?.();
    };
  }, [isOpen, onClose]);

  const loadMore = useCallback(async () => {
    if (isLoading || isLastPage) return;
    setIsLoading(true);
    try {
      const opts =
        cursor != null
          ? { lastCreatedAt: cursor.lastCreatedAt, lastId: cursor.lastId }
          : undefined;
      const { reviews: more, nextCursor } = await getMoreUserReviews(
        userId,
        opts
      );
      if (!more || more.length === 0) {
        setIsLastPage(true);
      } else {
        setReviews((prev) => [...prev, ...more]);
        if (!nextCursor) setIsLastPage(true);
      }
    } finally {
      setIsLoading(false);
    }
  }, [cursor, isLastPage, isLoading, userId]);

  useEffect(() => {
    if (!isOpen || isLastPage) return;
    const el = triggerRef.current;
    if (!el) return;
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          obs.unobserve(el);
          loadMore().finally(() => !isLastPage && obs.observe(el));
        }
      },
      { threshold: 0.5 }
    );
    observerRef.current = obs;
    obs.observe(el);
    return () => obs.disconnect();
  }, [isOpen, isLastPage, loadMore]);

  if (!isOpen) return null;
  const titleId = "profile-reviews-modal-title";

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          tabIndex={-1}
          className="relative w-full max-w-2xl max-h-[80vh] bg-white dark:bg-neutral-800 rounded-2xl shadow-xl animate-fade-in flex flex-col"
        >
          {/* header */}
          <div className="px-5 py-4 border-b dark:border-neutral-700">
            <h3
              id={titleId}
              className="text-lg sm:text-xl font-semibold text-center text-primary dark:text-primary-light"
            >
              받은 거래 후기
            </h3>
          </div>

          {/* body (only this scrolls) */}
          <div className="px-5 py-4 overflow-y-auto flex-1">
            {reviews.length === 0 ? (
              <div className="flex justify-center items-center min-h-[200px]">
                <span className="text-neutral-500 dark:text-white">
                  리뷰가 없습니다.
                </span>
              </div>
            ) : (
              <div className="space-y-5">
                <ReviewsList reviews={reviews} />
                {!isLastPage && (
                  <div className="flex justify-center mt-2">
                    <button
                      ref={triggerRef}
                      type="button"
                      onClick={() => !isLoading && loadMore()}
                      disabled={isLoading}
                      aria-busy={isLoading || undefined}
                      className="inline-flex items-center justify-center h-10 px-4 text-sm font-medium text-neutral-700 dark:text-neutral-200 bg-neutral-100 dark:bg-neutral-700 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <>
                          <span className="animate-spin" aria-hidden>
                            🌊
                          </span>{" "}
                          항해중...
                        </>
                      ) : (
                        <>
                          <span aria-hidden>⚓</span> 더 보기
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* footer (never scrolls away) */}
          <div className="px-5 py-4 border-t dark:border-neutral-700 flex justify-end">
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
