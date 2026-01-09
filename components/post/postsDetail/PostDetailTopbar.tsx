/**
 * File Name : components/post/postDetail/PostDetailTopbar
 * Description : 게시글 상세 상단바(뒤로가기 + 카테고리 + 작성자 + 수정 버튼)
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2025.11.13  임도헌   Created   상세 상단바 분리(레이아웃 의존 제거)
 * 2025.11.13  임도헌   Modified  작성자 정보/수정 버튼 Topbar로 이관
 */

"use client";

import Link from "next/link";
import BackButton from "@/components/common/BackButton";
import UserAvatar from "@/components/common/UserAvatar";
import { PencilSquareIcon } from "@heroicons/react/24/solid";
import { POST_CATEGORY } from "@/lib/constants";

interface Props {
  /** 카테고리 코드 (예: "GENERAL") */
  category?: string | null;
  /** 뒤로가기 기본 경로 (히스토리 없을 때 폴백) */
  backHref?: string; // 기본: /posts

  /** 작성자 정보 */
  authorUsername: string;
  authorAvatar?: string | null;

  /** 소유자일 때 수정 버튼 노출 */
  canEdit?: boolean;
  /** 수정 페이지 경로 (isOwner=true일 때만 사용) */
  editHref?: string;
}

export default function PostDetailTopbar({
  category,
  backHref,
  authorUsername,
  authorAvatar,
  canEdit,
  editHref,
}: Props) {
  const safeBack = backHref ?? "/posts";
  const categoryLabel =
    category && POST_CATEGORY[category as keyof typeof POST_CATEGORY];

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
          <UserAvatar
            username={authorUsername}
            avatar={authorAvatar ?? null}
            size="sm"
          />
        </div>

        {/* 가운데 여백 */}
        <div className="flex-1" />

        {/* 수정(소유자일 때만) */}
        {canEdit && editHref && (
          <Link
            href={editHref}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium 
                       text-white rounded-md bg-primary/80 dark:bg-primary-light/80 
                       hover:bg-primary dark:hover:bg-primary-light transition-colors"
          >
            <PencilSquareIcon className="size-4" />
            <span>수정</span>
          </Link>
        )}

        {/* 카테고리 */}
        {categoryLabel && (
          <Link
            href={`/posts?category=${encodeURIComponent(category!)}`}
            className="hidden sm:inline-flex px-3 py-1.5 text-xs sm:text-sm font-medium text-white 
                       rounded-full bg-primary/80 dark:bg-primary-light/80 
                       hover:bg-primary dark:hover:bg-primary-light transition-colors"
            aria-label={`카테고리 ${categoryLabel}로 보기`}
          >
            {categoryLabel}
          </Link>
        )}
      </div>
    </header>
  );
}
