/**
 * File Name : app/(tabs)/profile/[username]/loading
 * Description : 유저 프로필 페이지 로딩 스켈레톤
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2025.10.07  임도헌   Created   로딩 스켈레톤 추가
 * 2025.11.13  임도헌   Modified  UserProfile 섹션 구조에 맞춰 스켈레톤 정비
 */
export default function Loading() {
  return (
    <div className="min-h-screen bg-white dark:bg-neutral-900 transition-colors">
      <div className="mx-auto w-full max-w-6xl px-4 py-8">
        {/* 내부는 좌정렬/풀폭 (UserProfile와 동일) */}
        <div className="flex flex-col gap-6 text-left mx-4">
          {/* 헤더 : 아바타 / 이름 / 가입일 / 평점 / 팔로워·팔로잉 / 팔로우 버튼 */}
          <div className="pt-2">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              {/* 아바타 */}
              <div
                className="h-20 w-20 rounded-full bg-neutral-200 dark:bg-neutral-800 animate-pulse"
                aria-hidden
              />
              {/* 이름/가입일/평점/팔로워·팔로잉 */}
              <div className="flex flex-col gap-3">
                <div className="h-6 w-44 rounded bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
                <div className="h-4 w-64 rounded bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
                <div className="flex items-center gap-6">
                  {/* 평점 별 + 평균 */}
                  <div className="flex items-center gap-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div
                        key={i}
                        className="h-4 w-4 rounded bg-neutral-200 dark:bg-neutral-800 animate-pulse"
                      />
                    ))}
                    <div className="h-4 w-12 rounded bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
                  </div>
                  {/* 팔로워/팔로잉 */}
                  <div className="flex items-center gap-3">
                    <div className="h-4 w-24 rounded bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
                    <div className="h-4 w-24 rounded bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
                  </div>
                </div>
              </div>
              {/* 팔로우 버튼 */}
              <div className="mt-2 md:mt-0 md:ml-auto">
                <div className="h-10 w-28 rounded-lg bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
              </div>
            </div>
          </div>

          {/* 방송국 섹션 */}
          <section aria-hidden>
            <div className="section-h">
              <div className="h-5 w-20 rounded bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
              <div className="h-8 w-24 rounded-lg bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
            </div>
            <div className="mt-1 h-4 w-64 rounded bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
          </section>

          {/* 받은 거래 후기 */}
          <section aria-hidden>
            <div className="section-h">
              <div className="h-5 w-24 rounded bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
              <div className="h-8 w-28 rounded-lg bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
            </div>
          </section>

          {/* 획득한 뱃지 */}
          <section aria-hidden>
            <div className="section-h">
              <div className="h-5 w-24 rounded bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="h-7 w-20 rounded-full bg-neutral-200 dark:bg-neutral-800 animate-pulse"
                />
              ))}
            </div>
          </section>

          {/* 판매 목록 패널 (탭/뷰 전환/리스트·그리드/더 보기) */}
          <section aria-hidden>
            <h2 className="h-5 w-24 rounded bg-neutral-200 dark:bg-neutral-800 animate-pulse mb-2" />
            <div className="panel p-4">
              {/* 탭 */}
              <div className="flex justify-center gap-3 mb-4">
                <div className="h-9 w-20 rounded-lg bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
                <div className="h-9 w-20 rounded-lg bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
              </div>

              {/* 뷰 전환 버튼 */}
              <div className="flex justify-end gap-2 mb-3">
                <div className="h-9 w-9 rounded-lg bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
                <div className="h-9 w-9 rounded-lg bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
              </div>

              {/* 리스트/그리드 스켈레톤 — 기본은 리스트 느낌으로 */}
              <div className="flex flex-col gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 rounded-xl ring-1 ring-black/5 dark:ring-white/10 p-3"
                  >
                    <div className="h-20 w-20 rounded-lg bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-5 w-2/3 rounded bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
                      <div className="h-4 w-1/2 rounded bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
                    </div>
                    <div className="hidden sm:flex flex-col gap-2">
                      <div className="h-8 w-20 rounded bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
                      <div className="h-8 w-20 rounded bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>

              {/* 더 보기 버튼 자리 */}
              <div className="mt-4 flex justify-center">
                <div className="h-9 w-24 rounded-full bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
              </div>
            </div>
          </section>

          {/* SR 전용 상태 */}
          <span className="sr-only" role="status" aria-live="polite">
            유저 프로필을 불러오는 중…
          </span>
        </div>
      </div>
    </div>
  );
}
