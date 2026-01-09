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
 * 2025.11.13  임도헌   Modified  리뷰 메세지가 긴 경우 메시지를 펼칠 수 있도록 변경
 */
"use client";

import { useEffect, useRef, useState } from "react";
import type { ProfileReview } from "@/types/profile";
import UserAvatar from "../common/UserAvatar";
import TimeAgo from "../common/TimeAgo";

interface IReviewItemProps {
  review: ProfileReview;
}

export default function ReviewItem({ review }: IReviewItemProps) {
  const text = review.payload ?? "";
  const [expanded, setExpanded] = useState(false);
  const [overflowing, setOverflowing] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  // 컴포넌트 내부에서만 넘침 체크 (짧은 리뷰는 페이드/버튼 숨김)
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    const check = () => setOverflowing(el.scrollHeight > el.clientHeight);
    // 초기/리사이즈/폰트변경 대응
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    const id = requestAnimationFrame(check);
    return () => {
      ro.disconnect();
      cancelAnimationFrame(id);
    };
  }, [text]);

  return (
    <div className="border-b dark:border-neutral-700 pb-4 last:border-none">
      {/* 헤더 */}
      <div className="grid grid-cols-[auto,1fr,auto] gap-3 items-center">
        <UserAvatar
          avatar={review.user?.avatar}
          username={review.user?.username || ""}
          size="md"
        />
        <div className="min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-sm font-medium text-neutral-900 dark:text-white truncate max-w-[120px] sm:max-w-[160px]">
              {review.user?.username || ""}
            </span>
            <div
              className="flex items-center gap-1 shrink-0"
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
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
          </div>
        </div>
        <div className="justify-self-end text-xs text-neutral-500 dark:text-neutral-400 whitespace-nowrap">
          <TimeAgo date={review.created_at} />
        </div>
      </div>

      {/* 본문 */}
      <div className="mt-3 pl-[52px] sm:pl-[56px]">
        <div
          ref={contentRef}
          className={[
            "relative text-sm sm:text-base text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap break-words",
            expanded ? "" : "max-h-24 overflow-hidden pr-1", // 6줄 가량
          ].join(" ")}
          title={text || undefined}
        >
          {/* 긴 리뷰일 때만 페이드 표시 */}
          {!expanded && overflowing && (
            <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white dark:from-neutral-800 to-transparent" />
          )}
          {text || "내용 없음"}
        </div>

        {/* 긴 리뷰일 때만 더 보기/접기 노출 */}
        {overflowing && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="mt-2 text-xs font-medium text-primary dark:text-primary-light hover:underline"
          >
            {expanded ? "접기" : "더 보기"}
          </button>
        )}
      </div>
    </div>
  );
}
