/**
 * File Name : app/posts/[id]/edit/layout
 * Description : 게시글 편집 레이아웃(상단 공통 BackHeader + 컨테이너)
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2025.11.13  임도헌   Created   상단 고정 백 헤더/세이프에어리어/컨테이너 도입
 */

import type { ReactNode } from "react";
import BackButton from "@/components/common/BackButton";

export default function Layout({
  children,
  params,
}: {
  children: ReactNode;
  params: { id: string };
}) {
  // 뒤로가기 기본 목적지는 상세 페이지(있으면), 없으면 리스트로 폴백
  const idNum = Number(params.id);
  const defaultHref =
    Number.isFinite(idNum) && idNum > 0 ? `/posts/${idNum}` : "/posts";

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-900">
      {/* Sticky Back Header */}
      <header
        className="sticky top-0 z-40 backdrop-blur-md
                   bg-white/70 dark:bg-neutral-900/70
                   border-b border-neutral-200/70 dark:border-neutral-800
                   px-2 sm:px-4"
      >
        <div className="mx-auto max-w-3xl h-12 sm:h-14 flex items-center">
          <BackButton fallbackHref={defaultHref} />
          {/* 가운데 타이틀(고정 텍스트) */}
          <h1 className="ml-2 sm:ml-3 text-sm sm:text-base font-semibold text-neutral-900 dark:text-neutral-100">
            게시글 수정
          </h1>
          {/* 우측 공간 정렬용 */}
          <div className="ml-auto" />
        </div>
      </header>

      {/* Page body */}
      <main className="mx-auto max-w-3xl px-4 py-6 pt-0 sm:px-6 lg:px-8">
        {children}
      </main>

      {/* iOS safe area padding */}
      <div className="pb-[env(safe-area-inset-bottom)]" />
    </div>
  );
}
