/**
 * File Name : app/(tabs)/products/add/layout
 * Description : 제품 등록 레이아웃(상단바: 뒤로가기 + 제목, 본문 컨테이너)
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2025.11.13  임도헌   Created   뒤로가기/제목 상단바 + 공통 컨테이너
 */

import type { ReactNode } from "react";
import BackButton from "@/components/common/BackButton";

export default function AddProductLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white dark:bg-neutral-900">
      {/* 상단바 */}
      <header
        className="sticky top-0 z-40 h-12 sm:h-14
                   backdrop-blur-md bg-white/70 dark:bg-neutral-900/70
                   border-b border-neutral-200/70 dark:border-neutral-800
                   px-2 sm:px-4"
        role="banner"
      >
        <div className="mx-auto max-w-4xl h-full flex items-center gap-2">
          <BackButton fallbackHref="/products" />
          <h1 className="ml-1 text-[15px] sm:text-base font-semibold text-neutral-900 dark:text-neutral-50">
            제품 등록
          </h1>
        </div>
      </header>

      {/* 본문 컨테이너: 이미지 업로더/양식이 넓어서 4xl 컨테이너 사용 */}
      <main className="mx-auto max-w-4xl px-4 py-4 sm:py-6 pb-[max(1rem,env(safe-area-inset-bottom))]">
        {children}
      </main>

      {/* 스크린리더 안내 */}
      <span className="sr-only" aria-live="polite">
        제품 등록 폼을 불러오는 중입니다…
      </span>
    </div>
  );
}
