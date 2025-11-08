/**
 * File Name : app/(tabs)/profile/[username]/loading
 * Description : 유저 프로필 페이지 로딩 스켈레톤
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
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="h-20 w-20 rounded-full bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
          <div className="flex-1 space-y-3">
            <div className="h-6 w-48 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse" />
            <div className="h-4 w-64 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse" />
          </div>
          <div className="hidden sm:flex gap-2">
            <div className="h-10 w-24 bg-neutral-200 dark:bg-neutral-800 rounded-xl animate-pulse" />
            <div className="h-10 w-28 bg-neutral-200 dark:bg-neutral-800 rounded-xl animate-pulse" />
          </div>
        </div>

        {/* Follow counts / badge row */}
        <div className="mt-6 flex flex-wrap gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-6 w-24 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse"
            />
          ))}
          <div className="h-6 w-20 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse" />
          <div className="h-6 w-16 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse" />
        </div>

        {/* Tabs */}
        <div className="mt-8 flex gap-4">
          {["Overview", "Streams", "Posts", "Products", "Reviews"].map((k) => (
            <div
              key={k}
              className="h-9 w-24 bg-neutral-200 dark:bg-neutral-800 rounded-lg animate-pulse"
            />
          ))}
        </div>

        {/* Overview grid */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl overflow-hidden border border-neutral-200/70 dark:border-neutral-800"
            >
              <div className="aspect-video bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
              <div className="p-4 space-y-3">
                <div className="h-5 w-3/4 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse" />
                <div className="h-4 w-2/5 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
