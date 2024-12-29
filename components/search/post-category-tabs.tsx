/**
File Name : components/search/post-category-tabs.tsx
Description : 게시글 카테고리 탭 컴포넌트
Author : 임도헌

History
Date        Author   Status    Description
2024.12.19  임도헌   Created
2024.12.19  임도헌   Modified  게시글 카테고리 탭 컴포넌트 생성
2024.12.20  임도헌   Modified  게시글 카테고리 탭 컴포넌트 다크모드 추가
*/
"use client";

import { POST_CATEGORY } from "@/lib/constants";
import Link from "next/link";
import { useRef, useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { useFloating, offset, shift, flip } from "@floating-ui/react";

interface IPostCategoryTabsProps {
  currentCategory?: string;
}

// 카테고리 설명
const CATEGORY_DESCRIPTIONS = {
  Free: "자유롭게 이야기를 나눌 수 있는 공간입니다",
  CREW: "함께 보드게임을 즐길 모험대원을 모집하는 공간입니다",
  LOG: "보드게임 플레이 후기와 리뷰를 공유하는 공간입니다",
  MAP: "보드게임의 규칙과 공략을 공유하는 공간입니다",
  COMPASS: "보드게임에 대한 질문과 답변을 나누는 공간입니다",
} as const;

export default function PostCategoryTabs({
  currentCategory,
}: IPostCategoryTabsProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  /**
   * useFloating: Floating UI의 핵심 훅으로, 툴팁의 위치를 동적으로 계산하고 관리
   *
   * placement: 툴팁이 표시될 기본 위치 설정
   * - 'bottom': 요소 아래에 툴팁 배치
   * - 그 외 'top', 'left', 'right' 등 다양한 위치 지정 가능
   *
   * middleware: 툴팁 위치 조정을 위한 미들웨어 배열
   * 1. offset(8): 참조 요소로부터 8픽셀 거리 유지
   * 2. shift({ padding: 8 }): 뷰포트 경계에 닿으면 자동으로 위치 이동 (8픽셀 여백 유지)
   * 3. flip({ padding: 8 }): 공간이 부족하면 반대 방향으로 전환 (8픽셀 여백 유지)
   */
  const tooltipRefs = {
    all: useFloating({
      placement: "bottom",
      middleware: [offset(8), shift({ padding: 8 }), flip({ padding: 8 })],
    }),
    Free: useFloating({
      placement: "bottom",
      middleware: [offset(8), shift({ padding: 8 }), flip({ padding: 8 })],
    }),
    CREW: useFloating({
      placement: "bottom",
      middleware: [offset(8), shift({ padding: 8 }), flip({ padding: 8 })],
    }),
    LOG: useFloating({
      placement: "bottom",
      middleware: [offset(8), shift({ padding: 8 }), flip({ padding: 8 })],
    }),
    MAP: useFloating({
      placement: "bottom",
      middleware: [offset(8), shift({ padding: 8 }), flip({ padding: 8 })],
    }),
    COMPASS: useFloating({
      placement: "bottom",
      middleware: [offset(8), shift({ padding: 8 }), flip({ padding: 8 })],
    }),
  } as const;

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 200;
      const targetScroll =
        scrollContainerRef.current.scrollLeft +
        (direction === "left" ? -scrollAmount : scrollAmount);
      scrollContainerRef.current.scrollTo({
        left: targetScroll,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="relative">
      {/* 왼쪽 스크롤 버튼 */}
      <button
        onClick={() => scroll("left")}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center size-8 text-white bg-primary/80 dark:bg-primary-light/80 rounded-full shadow-lg hover:bg-primary dark:hover:bg-primary-light transition-colors"
        aria-label="scroll left"
      >
        <ChevronLeftIcon className="size-5" />
      </button>

      <div className="relative px-10">
        <div
          ref={scrollContainerRef}
          className="flex gap-2 overflow-x-hidden scroll-smooth items-center h-10"
        >
          <div
            ref={tooltipRefs.all.refs.setReference} // 툴팁의 기준점이 될 요소 지정
            className="relative flex-shrink-0"
            onMouseEnter={() => setActiveTooltip("all")}
            onMouseLeave={() => setActiveTooltip(null)}
          >
            <Link
              href="/posts"
              className={`px-4 py-2 rounded-full whitespace-nowrap transition-all hover:scale-105 ${
                !currentCategory
                  ? "bg-primary dark:bg-primary-light text-white shadow-lg shadow-primary/30 dark:shadow-primary-light/30"
                  : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"
              }`}
            >
              ⚓ 전체
            </Link>
          </div>

          {activeTooltip === "all" && (
            <div
              /**
               * tooltipRefs.all.refs.setFloating: 실제 툴팁 요소를 지정
               *
               * tooltipRefs.all.floatingStyles:
               * - Floating UI가 계산한 위치 스타일 (top, left 등)
               * - 뷰포트 경계, 스크롤 위치 등을 고려하여 자동으로 업데이트
               *
               * position: "fixed":
               * - 스크롤에 관계없이 뷰포트를 기준으로 고정 위치 지정
               * - 스크롤 시에도 참조 요소를 따라다니도록 함
               */
              ref={tooltipRefs.all.refs.setFloating}
              style={{
                ...tooltipRefs.all.floatingStyles,
                position: "fixed",
                zIndex: 9999,
              }}
              className="px-3 py-1.5 bg-neutral-800 dark:bg-neutral-700 text-white text-sm rounded-lg pointer-events-none"
            >
              모든 항해 일지를 볼 수 있습니다
            </div>
          )}

          {Object.entries(POST_CATEGORY).map(([key, value]) => (
            <div
              key={key}
              /**
               * 각 카테고리별 툴팁의 기준점 요소 지정
               * tooltipRefs[key].refs.setReference로 해당 카테고리의
               * 툴팁 위치 계산을 위한 기준점을 설정
               */
              ref={
                tooltipRefs[key as keyof typeof POST_CATEGORY].refs.setReference
              }
              className="relative flex-shrink-0"
              onMouseEnter={() => setActiveTooltip(key)}
              onMouseLeave={() => setActiveTooltip(null)}
            >
              <Link
                href={`/posts?category=${key}`}
                className={`px-4 py-2 rounded-full whitespace-nowrap transition-all hover:scale-105 ${
                  currentCategory === key
                    ? "bg-primary dark:bg-primary-light text-white shadow-lg shadow-primary/30 dark:shadow-primary-light/30"
                    : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                }`}
              >
                {value}
              </Link>
              {activeTooltip === key && (
                <div
                  /**
                   * 각 카테고리별 실제 툴팁 요소
                   * tooltipRefs[key].refs.setFloating으로 툴팁 요소를 지정하고
                   * floatingStyles를 적용하여 동적으로 위치가 조정됨
                   */
                  ref={
                    tooltipRefs[key as keyof typeof POST_CATEGORY].refs
                      .setFloating
                  }
                  style={{
                    ...tooltipRefs[key as keyof typeof POST_CATEGORY]
                      .floatingStyles,
                    position: "fixed",
                    zIndex: 9999,
                  }}
                  className="px-3 py-1.5 bg-neutral-800 dark:bg-neutral-700 text-white text-sm rounded-lg pointer-events-none"
                >
                  {
                    CATEGORY_DESCRIPTIONS[
                      key as keyof typeof CATEGORY_DESCRIPTIONS
                    ]
                  }
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 오른쪽 스크롤 버튼 */}
      <button
        onClick={() => scroll("right")}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center size-8 text-white bg-primary/80 dark:bg-primary-light/80 rounded-full shadow-lg hover:bg-primary dark:hover:bg-primary-light transition-colors"
        aria-label="scroll right"
      >
        <ChevronRightIcon className="size-5" />
      </button>
    </div>
  );
}
