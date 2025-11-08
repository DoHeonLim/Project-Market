/**
 * File Name : app/(tabs)/profile/loading
 * Description : 내 프로필 페이지 로딩 스켈레톤
 * Author : 임도헌
 *
 * History
 * Date        Author   Status     Description
 * 2025.10.07  임도헌   Created    로딩 스켈레톤 추가
 * 2025.10.29  임도헌   Modified   MyProfile 최신 레이아웃과 일치하도록 전면 수정(그라디언트/액션버튼/방송국/뱃지/카드 구성)
 */

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background/60 to-background/95 dark:from-background-dark/60 dark:to-background-dark/95 transition-colors duration-200">
      <div className="mx-auto px-4 py-8 max-w-6xl">
        {/* ThemeToggle 자리 맞춤 */}
        <div className="flex justify-end mb-4">
          <div
            className="h-9 w-20 rounded-lg bg-neutral-200 dark:bg-neutral-800 animate-pulse"
            aria-hidden="true"
          />
        </div>

        {/* 헤더: 아바타 / 이름 / 가입일 / 평점+팔로우 */}
        <div className="md:flex-row flex flex-col items-center justify-center w-full gap-6 pt-10">
          {/* Avatar */}
          <div
            className="h-24 w-24 rounded-full bg-neutral-200 dark:bg-neutral-800 animate-pulse"
            aria-hidden="true"
          />
          {/* 이름/가입일/평점+팔로우 */}
          <div className="flex flex-col items-center md:items-start justify-center gap-3 w-full md:w-auto">
            <div className="h-6 w-40 rounded bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
            <div className="h-4 w-56 rounded bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
            <div className="flex items-center gap-4">
              {/* 평점 */}
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-5 w-5 rounded bg-neutral-200 dark:bg-neutral-800 animate-pulse"
                    />
                  ))}
                </div>
                <div className="h-4 w-16 rounded bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
              </div>
              {/* 팔로워/팔로잉 숫자 */}
              <div className="flex items-center gap-3">
                <div className="h-4 w-20 rounded bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
                <div className="h-4 w-20 rounded bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
              </div>
            </div>
          </div>
        </div>

        {/* 액션 버튼 2개 (프로필 수정 / 비밀번호 변경) */}
        <div className="mt-8 flex flex-col md:flex-row items-center justify-center gap-6 w-full max-w-md mx-auto">
          <div className="h-11 w-full md:w-1/2 rounded-lg bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
          <div className="h-11 w-full md:w-1/2 rounded-lg bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
        </div>

        {/* 이메일 인증 or 상태 박스 자리 */}
        <div className="mt-4 flex flex-col md:flex-row items-center justify-center gap-6 w-full max-w-md mx-auto">
          <div className="h-11 w-full md:w-1/2 rounded-lg bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
        </div>

        {/* 알림 설정 카드 */}
        <div className="mt-6 w-full max-w-md mx-auto">
          <div className="text-lg font-semibold mb-4 h-6 w-28 rounded bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
          <div className="flex items-center justify-between p-4 bg-white dark:bg-neutral-800 rounded-lg border border-gray-200 dark:border-neutral-700">
            <div className="space-y-2">
              <div className="h-5 w-28 rounded bg-neutral-200 dark:bg-neutral-700 animate-pulse" />
              <div className="h-4 w-56 rounded bg-neutral-200 dark:bg-neutral-700 animate-pulse" />
            </div>
            <div className="h-6 w-12 rounded-full bg-neutral-200 dark:bg-neutral-700 animate-pulse" />
          </div>
        </div>

        {/* 내 방송국 섹션 */}
        <div className="w-full max-w-md mx-auto mt-8 gap-2">
          <div className="flex justify-between items-center mb-2">
            <div className="h-6 w-24 rounded bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
            <div className="h-8 w-24 rounded-lg bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="min-w-[240px] rounded-xl border border-neutral-200/60 dark:border-neutral-800 overflow-hidden"
              >
                <div className="aspect-video bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
                <div className="p-3 space-y-2">
                  <div className="h-5 w-3/4 rounded bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
                  <div className="h-4 w-1/2 rounded bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 거래 정보 카드 (판매 제품 / 구매 제품) */}
        <div className="w-full max-w-md mx-auto mt-8">
          <div className="text-lg font-semibold mb-4 h-6 w-24 rounded bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <div
                key={i}
                className="card p-6 rounded-2xl bg-primary/80 dark:bg-primary/60 text-white"
                aria-hidden="true"
              >
                <div className="h-6 w-24 rounded bg-white/40 dark:bg-white/30 animate-pulse" />
                <div className="mt-3 h-4 w-40 rounded bg-white/30 dark:bg-white/20 animate-pulse" />
              </div>
            ))}
          </div>
        </div>

        {/* 받은 거래 후기 버튼 */}
        <div className="w-full max-w-md mx-auto mt-8">
          <div className="text-lg font-semibold mb-4 h-6 w-28 rounded bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
          <div className="h-11 w-full rounded-lg bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
        </div>

        {/* 뱃지 섹션 + 버튼 */}
        <div className="w-full max-w-md mx-auto mt-8">
          <div className="flex items-center justify-between mb-4">
            <div className="h-6 w-24 rounded bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-7 w-20 rounded-full bg-neutral-200 dark:bg-neutral-800 animate-pulse"
              />
            ))}
          </div>
          <div className="h-11 w-full rounded-lg bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
        </div>

        {/* 로그아웃 버튼 자리 */}
        <div className="w-full max-w-md mx-auto mt-6">
          <div className="h-12 w-full rounded-md bg-rose-300/70 dark:bg-rose-800/70 animate-pulse" />
        </div>

        {/* 스크린리더 안내(시멘틱 로딩) */}
        <span className="sr-only" role="status" aria-live="polite">
          내 프로필 페이지를 불러오는 중입니다…
        </span>
      </div>
    </div>
  );
}
