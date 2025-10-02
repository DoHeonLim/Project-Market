/**
 * File Name : components/stream/StreamEmptyState
 * Description : 스트리밍 목록 Empty 상태
 * Author : 임도헌
 *
 * History
 * 2025.08.25  임도헌   Created
 * 2025.09.10  임도헌   Modified  a11y(role/aria-live) 및 복구 링크(필터 초기화/전체 보기) 추가
 */

import Link from "next/link";

interface Props {
  keyword?: string;
  category?: string;
  scope?: "all" | "following";
}

export default function StreamEmptyState({ keyword, category, scope }: Props) {
  const hasKeyword = !!keyword;
  const hasCategory = !!category;
  const isFollowingScope = scope === "following";

  const hasFilter = hasKeyword || hasCategory || isFollowingScope;

  return (
    <div
      role="status"
      aria-live="polite"
      className="py-16 text-center text-neutral-500 dark:text-neutral-400"
    >
      {hasFilter ? (
        <>
          <p className="mb-2">조건에 맞는 스트리밍이 없습니다.</p>
          <p className="text-sm mb-4">검색어나 카테고리를 바꿔보세요.</p>

          <div className="flex items-center justify-center gap-2">
            {(hasKeyword || hasCategory) && (
              <Link
                href="/streams"
                className="inline-flex items-center rounded-lg border border-neutral-300 dark:border-neutral-700 px-3 py-1.5 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                필터 초기화
              </Link>
            )}
            {isFollowingScope && (
              <Link
                href="/streams"
                className="inline-flex items-center rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 px-3 py-1.5 text-sm font-medium hover:opacity-90"
              >
                전체 라이브 보기
              </Link>
            )}
          </div>
        </>
      ) : (
        <p>현재 라이브 중인 스트리밍이 없습니다.</p>
      )}
    </div>
  );
}
