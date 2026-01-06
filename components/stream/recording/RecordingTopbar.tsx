/**
 * File Name : components/stream/recording/RecordingTopbar
 * Description : 스트리밍 녹화본 상단바(뒤로가기 + 작성자 정보 + 카테고리)
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2025.11.26  임도헌   Created   녹화본 상세 상단바 분리(뒤로가기/유저/카테고리)
 */

"use client";

import BackButton from "@/components/common/BackButton";
import UserAvatar from "@/components/common/UserAvatar";

interface RecordingTopbarProps {
  /** 뒤로가기 기본 경로 (히스토리 없을 때 폴백) */
  backHref?: string; // 기본: /streams

  /** 방송 소유자 정보 */
  username: string;
  avatar: string | null;

  /** 방송 카테고리 표시용 (선택) */
  categoryLabel?: string | null;
  categoryIcon?: string | null;
}

export default function RecordingTopbar({
  backHref,
  username,
  avatar,
  categoryLabel,
  categoryIcon,
}: RecordingTopbarProps) {
  const safeBack = backHref ?? "/streams";

  return (
    <header
      className="sticky top-0 z-40 backdrop-blur-md
                 bg-white/70 dark:bg-neutral-900/70
                 border-b border-neutral-200/70 dark:border-neutral-800"
      role="banner"
    >
      <div className="mx-auto max-w-3xl h-12 sm:h-14 flex items-center gap-2 px-2 sm:px-4">
        {/* 뒤로가기 */}
        <BackButton fallbackHref={safeBack} />

        {/* 작성자 */}
        <div className="flex items-center gap-2 min-w-0">
          <UserAvatar username={username} avatar={avatar} size="sm" />
        </div>

        {/* 가운데 여백 */}
        <div className="flex-1" />

        {/* 카테고리 배지 (선택) */}
        {categoryLabel && (
          <div
            className="hidden sm:inline-flex px-3 py-1.5 text-xs sm:text-sm font-medium text-white 
          rounded-full bg-primary/80 dark:bg-primary-light/80 
          hover:bg-primary dark:hover:bg-primary-light transition-colors"
          >
            {categoryIcon && <span aria-hidden="true">{categoryIcon}</span>}
            <span>{categoryLabel}</span>
          </div>
        )}
      </div>
    </header>
  );
}
