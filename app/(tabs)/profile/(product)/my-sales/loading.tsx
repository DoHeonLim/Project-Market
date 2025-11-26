/**
 * File Name : app/(tabs)/profile/(product)/my-sales/loading
 * Description : 나의 판매 제품 페이지 로딩 스켈레톤
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2025.10.07  임도헌   Created   로딩 스켈레톤 추가
 * 2025.11.13  임도헌   Modified  현재 UI(탭+카드+액션) 구조와 톤으로 재정렬
 */
export default function Loading() {
  return (
    <div className="min-h-screen bg-white dark:bg-neutral-900 transition-colors">
      <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:py-8">
        {/* 상단: 뒤로가기 자리 */}
        <div className="mb-4">
          <div className="h-9 w-24 rounded-lg bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
        </div>

        {/* 타이틀 */}
        <div className="h-7 w-32 mx-auto rounded bg-neutral-200 dark:bg-neutral-800 animate-pulse" />

        {/* 탭 버튼 3개 */}
        <div className="mt-6 flex justify-center gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-10 w-28 sm:w-32 rounded-lg bg-neutral-200 dark:bg-neutral-800 animate-pulse"
            />
          ))}
        </div>

        {/* 카드 리스트 스켈레톤 */}
        <div className="mt-6 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5 dark:bg-neutral-800 dark:ring-white/5"
              aria-hidden
            >
              <div className="flex gap-5">
                {/* 썸네일 */}
                <div className="relative size-28 shrink-0 overflow-hidden rounded-xl ring-1 ring-black/10 dark:ring-white/10">
                  <div className="absolute inset-0 bg-neutral-200 dark:bg-neutral-700 animate-pulse" />
                </div>

                {/* 본문 */}
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  {/* 상단 행: 제목/상태필 */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="h-5 w-3/4 rounded bg-neutral-200 dark:bg-neutral-700 animate-pulse" />
                      {/* 가격 */}
                      <div className="h-5 w-24 rounded bg-neutral-200 dark:bg-neutral-700 animate-pulse" />
                    </div>
                    <div className="h-6 w-16 rounded-full bg-neutral-200 dark:bg-neutral-700 animate-pulse" />
                  </div>

                  {/* 메타칩 */}
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {[1, 2, 3].map((k) => (
                      <div
                        key={k}
                        className="h-5 w-16 rounded-full bg-neutral-200 dark:bg-neutral-700 animate-pulse"
                      />
                    ))}
                  </div>

                  {/* 지표(좋아요/조회수) */}
                  <div className="mt-1 flex gap-4">
                    <div className="h-4 w-12 rounded bg-neutral-200 dark:bg-neutral-700 animate-pulse" />
                    <div className="h-4 w-12 rounded bg-neutral-200 dark:bg-neutral-700 animate-pulse" />
                    <div className="hidden sm:block h-4 w-20 rounded bg-transparent" />
                  </div>

                  {/* 타임라인 */}
                  <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
                    <div className="h-3.5 w-24 rounded bg-neutral-200 dark:bg-neutral-700 animate-pulse" />
                    <div className="h-3.5 w-24 rounded bg-neutral-200 dark:bg-neutral-700 animate-pulse" />
                    <div className="h-3.5 w-24 rounded bg-neutral-200 dark:bg-neutral-700 animate-pulse" />
                  </div>
                </div>
              </div>

              {/* 액션 버튼 영역 */}
              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="h-10 rounded-xl bg-neutral-200 dark:bg-neutral-700 animate-pulse" />
                <div className="h-10 rounded-xl bg-neutral-200 dark:bg-neutral-700 animate-pulse" />
              </div>
            </div>
          ))}
        </div>

        {/* 하단 더보기 트리거 자리 */}
        <div className="mt-6 flex justify-center">
          <div className="h-9 w-28 rounded-full bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
