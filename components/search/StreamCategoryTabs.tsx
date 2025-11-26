/**
 * File Name : components/search/StreamCategoryTabs
 * Description : 스트리밍 카테고리 탭
 * Author : 임도헌
 *
 * History
 * 2025.05.22  임도헌   Created
 * 2025.05.22  임도헌   Modified  스트리밍 카테고리 탭 추가
 * 2025.09.10  임도헌   Modified  검색/스코프 파라미터 유지, a11y(aria-current) 보강
 * 2025.11.23  임도헌   Modified  모바일 UI 수정
 */
"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { STREAM_CATEGORY } from "@/lib/constants";

interface StreamCategoryTabsProps {
  currentCategory?: string;
}

export default function StreamCategoryTabs({
  currentCategory,
}: StreamCategoryTabsProps) {
  const searchParam = useSearchParams();

  // 기존 keyword/scope를 보존하면서 category만 바꾸는 href 빌더
  const buildHref = useMemo(() => {
    return (nextCategory?: string) => {
      const params = new URLSearchParams(searchParam?.toString() ?? "");

      // category 갱신
      if (!nextCategory) params.delete("category");
      else params.set("category", nextCategory);
      const q = params.toString();
      return q ? `/streams?${q}` : `/streams`;
    };
  }, [searchParam]);

  return (
    <nav
      className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-1.5 sm:pb-2"
      aria-label="스트리밍 카테고리"
    >
      <Link
        href={buildHref(undefined)}
        aria-current={!currentCategory ? "page" : undefined}
        className={`
        rounded-full whitespace-nowrap transition-colors
        px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm  
        ${
          !currentCategory
            ? "bg-primary text-white dark:bg-primary-light"
            : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        }
      `}
      >
        전체
      </Link>
      {Object.entries(STREAM_CATEGORY).map(([key, label]) => {
        const active = currentCategory === key;
        return (
          <Link
            key={key}
            href={buildHref(key)}
            aria-current={active ? "page" : undefined}
            className={`
            rounded-full whitespace-nowrap transition-colors
            px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm   
            ${
              active
                ? "bg-primary text-white dark:bg-primary-light"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            }
          `}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
