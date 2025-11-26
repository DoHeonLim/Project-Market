/**
 * File Name : app/(tabs)/profile/(product)/my-purchases/layout
 * Description : '나의 구매 제품' 섹션 공통 레이아웃(상단 앱바 + BackButton)
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2025.11.13  임도헌   Created   섹션 전용 레이아웃 추가(모바일 sticky 앱바, 데스크톱 동일 스타일)
 */

import type { ReactNode } from "react";
import BackButton from "@/components/common/BackButton";

export default function MyPurchasesLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white dark:bg-neutral-900 transition-colors">
      {/* 상단 앱바: 모바일에선 고정, 데스크톱도 동일 스타일 유지 */}
      <header
        className="
          sticky top-0 z-40
          bg-background/80 dark:bg-background-dark/80
          backdrop-blur supports-[backdrop-filter]:bg-background/60
          border-b border-neutral-200/70 dark:border-neutral-800
        "
      >
        <div className="mx-auto max-w-3xl px-3 sm:px-4">
          <div className="h-12 sm:h-[52px] flex items-center gap-2">
            {/* 뒤로가기: history 있으면 back, 없으면 /profile 로 이동 */}
            <BackButton fallbackHref="/profile" variant="appbar" />
            <h1 className="text-[15px] sm:text-[16px] font-semibold">
              구매 제품
            </h1>

            {/* 오른쪽 여백 확보용 */}
            <div className="ml-auto" aria-hidden />
          </div>
        </div>
      </header>

      {/* 본문 */}
      <main className="mx-auto max-w-3xl">{children}</main>

      {/* safe-area 하단 여백 */}
      <div className="pb-[env(safe-area-inset-bottom)]" />
    </div>
  );
}
