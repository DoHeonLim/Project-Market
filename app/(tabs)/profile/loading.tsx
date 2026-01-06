/**
 * File Name : app/(tabs)/profile/loading
 * Description : 내 프로필 페이지 로딩 스켈레톤
 * Author : 임도헌
 *
 * History
 * Date        Author   Status     Description
 * 2025.10.07  임도헌   Created    로딩 스켈레톤 추가
 * 2025.10.29  임도헌   Modified   MyProfile 최신 레이아웃과 일치하도록 전면 수정(그라디언트/액션버튼/방송국/뱃지/카드 구성)
 * 2025.11.13  임도헌   Modified   MyProfile 섹션 구조에 맞춰 스켈레톤 정비
 */
export default function Loading() {
  return (
    <div className="min-h-screen bg-white dark:bg-neutral-900 transition-colors">
      <div className="mx-auto w-full max-w-6xl px-4 py-8">
        {/* 내부는 좌정렬 */}
        <div className="flex flex-col gap-6 text-left mx-4">
          {/* 헤더 */}
          <div className="pt-2">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              {/* 아바타 */}
              <div className="h-20 w-20 rounded-full bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
              {/* 이름/가입일/평점/팔로우 */}
              <div className="flex flex-col gap-3">
                <div className="h-6 w-40 rounded bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
                <div className="h-4 w-56 rounded bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div
                        key={i}
                        className="h-4 w-4 rounded bg-neutral-200 dark:bg-neutral-800 animate-pulse"
                      />
                    ))}
                    <div className="h-4 w-10 rounded bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-4 w-20 rounded bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
                    <div className="h-4 w-20 rounded bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 알림 설정 */}
          <section aria-hidden className="space-y-2">
            <div className="h-5 w-16 rounded bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
            <div className="panel">
              <div className="flex items-center justify-between gap-4 px-4 py-3 rounded-lg ring-1 ring-black/5 dark:ring-white/5 bg-white dark:bg-neutral-800">
                <div className="space-y-2">
                  <div className="h-5 w-24 rounded bg-neutral-200 dark:bg-neutral-700 animate-pulse" />
                  <div className="h-4 w-52 rounded bg-neutral-200 dark:bg-neutral-700 animate-pulse" />
                </div>
                <div className="h-6 w-12 rounded-full bg-neutral-200 dark:bg-neutral-700 animate-pulse" />
              </div>
            </div>
          </section>

          {/* 내 방송국 */}
          <section aria-hidden>
            <div className="flex items-center justify-between">
              <div className="h-5 w-20 rounded bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
              <div className="h-6 w-24 rounded bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
            </div>
            <div className="mt-2 flex gap-3 overflow-x-auto pb-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="min-w-[240px] rounded-xl overflow-hidden ring-1 ring-black/10 dark:ring-white/10"
                >
                  <div className="aspect-video bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
                  <div className="p-3 space-y-2">
                    <div className="h-5 w-40 rounded bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
                    <div className="h-4 w-28 rounded bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 거래 정보 — 타일 2개 */}
          <section aria-hidden>
            <div className="h-5 w-16 rounded bg-neutral-200 dark:bg-neutral-800 animate-pulse mb-2" />
            <div className="grid grid-cols-2 gap-2 max-w-xl">
              {[0, 1].map((k) => (
                <div
                  key={k}
                  className="tile-strong p-4 rounded-xl ring-1 ring-black/5 dark:ring-white/10 bg-neutral-100 dark:bg-neutral-800"
                >
                  <div className="h-4 w-20 rounded bg-neutral-300 dark:bg-neutral-700 animate-pulse" />
                  <div className="mt-2 h-3.5 w-32 rounded bg-neutral-300 dark:bg-neutral-700 animate-pulse" />
                  <div className="mt-3 h-4 w-16 rounded bg-neutral-300 dark:bg-neutral-700 animate-pulse" />
                </div>
              ))}
            </div>
          </section>

          {/* 받은 거래 후기 (버튼) */}
          <section aria-hidden>
            <div className="flex items-center justify-between">
              <div className="h-5 w-24 rounded bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
              <div className="h-8 w-28 rounded-lg bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
            </div>
          </section>

          {/* 획득한 뱃지 */}
          <section aria-hidden>
            <div className="flex items-center justify-between">
              <div className="h-5 w-24 rounded bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
              <div className="h-8 w-28 rounded-lg bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="h-7 w-20 rounded-full bg-neutral-200 dark:bg-neutral-800 animate-pulse"
                />
              ))}
            </div>
          </section>

          {/* 로그아웃 버튼 */}
          <div className="w-full flex items-center justify-center max-w-md">
            <div className="w-full px-4 py-3 mt-2 text-[13px] rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium" />
          </div>

          {/* SR 전용 상태 */}
          <span className="sr-only" role="status" aria-live="polite">
            내 프로필 정보를 불러오는 중…
          </span>
        </div>
      </div>
    </div>
  );
}
