/**
 * File Name : app/(tabs)/profile/[username]/channel/loading
 * Description : 유저 방송국 페이지 로딩 스켈레톤
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2025.10.07  임도헌   Created   로딩 스켈레톤 추가
 */

export default function Loading() {
  return (
    <div className="min-h-screen bg-white dark:bg-neutral-900 transition-colors">
      <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:py-8">
        {/* Channel Header */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
            <div className="space-y-2">
              <div className="h-6 w-40 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse" />
              <div className="h-4 w-64 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse" />
            </div>
          </div>
          <div className="hidden sm:flex gap-2">
            <div className="h-10 w-28 bg-neutral-200 dark:bg-neutral-800 rounded-xl animate-pulse" />
            <div className="h-10 w-28 bg-neutral-200 dark:bg-neutral-800 rounded-xl animate-pulse" />
          </div>
        </div>

        {/* Filters */}
        <div className="mt-6 flex flex-wrap gap-3">
          {["All", "Live", "Recordings"].map((k) => (
            <div
              key={k}
              className="h-8 w-24 bg-neutral-200 dark:bg-neutral-800 rounded-lg animate-pulse"
            />
          ))}
          <div className="h-8 w-40 bg-neutral-200 dark:bg-neutral-800 rounded-lg animate-pulse" />
        </div>

        {/* Stream grid */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl overflow-hidden border border-neutral-200/70 dark:border-neutral-800"
            >
              <div className="relative aspect-video bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
              <div className="p-4 space-y-3">
                <div className="h-5 w-4/5 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse" />
                <div className="h-4 w-1/3 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
