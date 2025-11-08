/**
 * File Name : app/(tabs)/profile/(product)/my-purchases/loading
 * Description : 나의 구매 제품 페이지 로딩 스켈레톤
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2025.10.07  임도헌   Created   로딩 스켈레톤 추가
 */

export default function Loading() {
  return (
    <div className="min-h-screen bg-white dark:bg-neutral-900 transition-colors">
      <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:py-8">
        {/* Top actions / back */}
        <div className="mb-4 flex items-center justify-between">
          <div className="h-9 w-24 rounded-lg bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
          <div className="hidden sm:flex gap-2">
            <div className="h-9 w-24 rounded-lg bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
            <div className="h-9 w-28 rounded-lg bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
          </div>
        </div>

        {/* Title */}
        <div className="h-7 w-44 rounded bg-neutral-200 dark:bg-neutral-800 animate-pulse" />

        {/* List skeleton */}
        <div className="mt-6 space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 rounded-2xl border border-neutral-200/70 dark:border-neutral-800 p-4"
            >
              <div className="h-20 w-20 rounded-xl bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
              <div className="flex-1 space-y-3">
                <div className="h-5 w-3/5 rounded bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
                <div className="h-4 w-2/5 rounded bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
                <div className="h-4 w-1/4 rounded bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
              </div>
              <div className="hidden sm:flex flex-col gap-2">
                <div className="h-9 w-24 rounded-xl bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
                <div className="h-9 w-24 rounded-xl bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
