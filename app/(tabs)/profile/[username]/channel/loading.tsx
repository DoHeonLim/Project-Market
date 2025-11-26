/**
 * File Name : app/(tabs)/profile/[username]/channel/loading
 * Description : 유저 방송국 페이지 로딩 스켈레톤
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2025.10.07  임도헌   Created   로딩 스켈레톤 추가
 * 2025.11.13  임도헌   Modified  헤더/히어로/다시보기 섹션 구조로 전면 개편
 */

export default function Loading() {
  return (
    <div className="min-h-screen bg-white dark:bg-neutral-900 transition-colors">
      {/* 헤더 */}
      <div className="mx-auto max-w-3xl px-4 pt-6 pb-2">
        <div className="flex items-center gap-3">
          {/* 아바타 */}
          <div
            className="h-12 w-12 rounded-full bg-neutral-200 dark:bg-neutral-800 animate-pulse"
            aria-hidden
          />
          {/* FollowSection 자리(팔로워/팔로잉/팔로우 버튼) */}
          <div className="flex-1">
            <div className="flex justify-center gap-3 mt-1">
              <div className="h-6 w-24 rounded bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
              <div className="h-6 w-24 rounded bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
              <div className="h-8 w-24 rounded-lg bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
            </div>
          </div>
        </div>

        {/* 프로필로 가기 버튼 자리 */}
        <div className="flex justify-center mt-3 mb-1">
          <div className="h-11 w-full max-w-md rounded-lg bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
        </div>
      </div>

      {/* 실시간 방송 히어로 */}
      <section className="mx-auto max-w-3xl px-4">
        <div className="h-5 w-24 rounded bg-neutral-200 dark:bg-neutral-800 animate-pulse mb-3" />
        <div className="rounded-2xl overflow-hidden shadow">
          <div className="relative aspect-video bg-neutral-200 dark:bg-neutral-800 animate-pulse">
            {/* 좌상단 배지들 자리 */}
            <div className="absolute top-3 left-3 flex gap-2">
              <div className="h-6 w-12 rounded bg-red-400/80 animate-pulse" />
              <div className="h-6 w-16 rounded bg-yellow-300/80 animate-pulse" />
            </div>
          </div>
          <div className="p-4 space-y-2">
            <div className="h-5 w-3/4 rounded bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
            <div className="h-4 w-1/2 rounded bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
          </div>
        </div>
      </section>

      {/* 다시보기 그리드 */}
      <section className="mx-auto max-w-3xl px-4 mt-8 pb-10">
        <div className="h-5 w-20 rounded bg-neutral-200 dark:bg-neutral-800 animate-pulse mb-3" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl overflow-hidden shadow">
              <div className="aspect-video bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
              <div className="p-3 space-y-2">
                <div className="h-5 w-4/5 rounded bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
                <div className="h-4 w-2/5 rounded bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SR 전용 상태 */}
      <span className="sr-only" role="status" aria-live="polite">
        방송국을 불러오는 중…
      </span>
    </div>
  );
}
