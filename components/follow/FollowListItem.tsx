/**
 * File Name : components/follow/FollowListItem
 * Description : 팔로우 리스트 아이템 (SSOT: user.isFollowedByViewer만 신뢰)
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2025.05.22  임도헌   Created
 * 2025.09.14  임도헌   Modified  a11y 보강, isMe 가드
 * 2025.10.14  임도헌   Modified  토글/로딩은 컨트롤러 단일 책임으로 이동
 * 2025.12.20  임도헌   Modified  로컬 following 제거(단일 소스화)
 * 2025.12.20  임도헌   Modified  a11yProps merge 순서 정리(aria-pressed/busy/label 보호)
 * 2026.01.05  임도헌   Modified  a11yProps.className 병합 + "나" 뱃지 조건 정교화
 */

"use client";

import { useMemo } from "react";
import type { ButtonHTMLAttributes } from "react";

import UserAvatar from "@/components/common/UserAvatar";
import type { FollowListUser } from "@/types/profile";

interface FollowListItemProps {
  user: FollowListUser;
  viewerId?: number;

  /** 행 단위 pending */
  pending?: boolean;

  /** 버튼 노출 여부 */
  showButton?: boolean;

  /** 외부 컨트롤러 토글 핸들러(단일 책임) */
  onToggle?: (userId: number) => void | Promise<void>;

  buttonVariant?: "primary" | "outline";
  buttonSize?: "sm" | "md";

  /** (옵션) 접근성/속성 주입 */
  a11yProps?: ButtonHTMLAttributes<HTMLButtonElement>;
}

export default function FollowListItem({
  user,
  viewerId,
  pending = false,
  showButton = true,
  onToggle,
  buttonVariant = "outline",
  buttonSize = "sm",
  a11yProps,
}: FollowListItemProps) {
  const isMe = viewerId != null && user.id === viewerId;

  // SSOT: user.isFollowedByViewer만 신뢰
  const following = !!user.isFollowedByViewer;

  const sizes = useMemo(
    () => ({
      btn: buttonSize === "sm" ? "text-sm px-3 py-1.5" : "text-base px-4 py-2",
    }),
    [buttonSize]
  );

  const handleClick = async () => {
    if (!onToggle || pending) return;
    await onToggle(user.id);
  };

  const ariaLabel = pending
    ? "팔로우 처리 중"
    : following
      ? "팔로우 취소"
      : "팔로우 하기";

  // a11yProps 병합:
  // - aria-*는 아래에서 최종 고정
  // - className은 덮어쓰기 방지를 위해 병합
  const { className: a11yClassName, ...restA11y } = a11yProps ?? {};

  const buttonClassName = [
    "rounded-md transition-colors disabled:opacity-60 disabled:cursor-not-allowed",
    "inline-flex items-center gap-2", // pending 시 텍스트 흔들림 최소화
    sizes.btn,
    following
      ? "bg-neutral-200 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-300 dark:hover:bg-neutral-600"
      : buttonVariant === "primary"
        ? "bg-primary text-white hover:bg-primary/90"
        : "border border-neutral-300 dark:border-neutral-600 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-700",
    a11yClassName,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-3">
        <UserAvatar username={user.username} avatar={user.avatar} size="sm" />
      </div>

      {showButton && !isMe ? (
        <button
          type="button"
          onClick={handleClick}
          disabled={pending}
          {...restA11y}
          aria-pressed={following}
          aria-busy={pending}
          aria-label={ariaLabel}
          className={buttonClassName}
        >
          {pending && (
            <span
              aria-hidden="true"
              className="h-3.5 w-3.5 rounded-full border-2 border-white/70 border-t-transparent animate-spin"
            />
          )}
          {pending ? "처리 중..." : following ? "팔로우 취소" : "팔로우"}
        </button>
      ) : isMe ? (
        <span
          className="rounded bg-neutral-200 px-2 py-1 text-xs text-neutral-700 dark:bg-neutral-700 dark:text-neutral-200"
          aria-label="내 계정"
          title="내 계정"
        >
          나
        </span>
      ) : null}
    </div>
  );
}
