/**
 * File Name : app/offline/page
 * Description : 오프라인 상태 안내 페이지(PWA fallback)
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2025.11.29  임도헌   Created   오프라인 전용 안내 페이지 추가
 * 2025.11.29  임도헌   Modified  보트포트 컨셉에 맞는 UI 및 안내 텍스트 정리
 */

import Link from "next/link";

export default function OfflinePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-slate-100 dark:from-neutral-900 dark:via-neutral-950 dark:to-neutral-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl bg-white/90 dark:bg-neutral-900/90 shadow-lg border border-neutral-100/80 dark:border-neutral-800/80 p-6 sm:p-8">
        <div className="flex flex-col items-center text-center gap-4">
          {/* 아이콘 */}
          <div className="h-14 w-14 rounded-2xl bg-sky-100 dark:bg-sky-900/40 flex items-center justify-center">
            <span className="text-2xl" aria-hidden>
              📡
            </span>
          </div>

          {/* 타이틀/설명 */}
          <div className="space-y-1">
            <h1 className="text-lg sm:text-xl font-semibold text-neutral-900 dark:text-neutral-50">
              지금은 바다와의 연결이 끊어졌어요
            </h1>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              인터넷 연결이 없어 보트포트 항구에 접속할 수 없습니다.
              <br className="hidden sm:inline" />
              네트워크가 다시 연결되면 자동으로 항해를 이어갈 수 있어요.
            </p>
          </div>

          {/* 가이드 박스 */}
          <div className="w-full rounded-xl bg-sky-50 dark:bg-neutral-800/80 px-4 py-3 text-left text-xs sm:text-[13px] text-sky-900 dark:text-sky-100">
            <p className="font-medium mb-1">잠깐, 이렇게 해볼까요?</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>Wi-Fi 또는 모바일 데이터 연결을 확인해 주세요.</li>
              <li>브라우저를 새로 고침해서 다시 접속해 보세요.</li>
              <li>
                PWA로 설치한 경우, 최근에 본 페이지는 일부 오프라인에서도 열릴
                수 있어요.
              </li>
            </ul>
          </div>

          {/* 홈으로 이동 버튼 */}
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-medium bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-white transition-colors"
          >
            항구로 돌아가기
          </Link>
        </div>
      </div>
    </main>
  );
}
