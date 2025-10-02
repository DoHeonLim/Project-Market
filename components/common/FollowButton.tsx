/**
 * File Name : components/common/FollowButton
 * Description : 팔로우/언팔 토글 버튼 (낙관적 업데이트 + 롤백)
 * Author : 임도헌
 *
 * History
 * 2025.09.06  임도헌   Created
 */

"use client";

import { useState } from "react";
import { useFollowToggle } from "@/hooks/useFollowToggle";

interface Props {
  targetUserId: number;
  initialIsFollowing: boolean;
  // 선택: 카운트 표시/관리
  initialCount?: number;
  onCountChange?: (next: number) => void;
  // 선택: 로그인 필요 시 동작
  onRequireLogin?: () => void;
  // 스타일 확장
  className?: string;
  size?: "sm" | "md";
}

export default function FollowButton({
  targetUserId,
  initialIsFollowing,
  initialCount,
  onCountChange,
  onRequireLogin,
  className = "",
  size = "md",
}: Props) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [count, setCount] = useState<number | undefined>(initialCount);
  const { toggle, isPending } = useFollowToggle();

  const pending = isPending(targetUserId);
  const nextLabel = isFollowing ? "팔로우 취소" : "팔로우";

  const handleClick = () => {
    const wasFollowing = isFollowing;
    const optimisticCount =
      typeof count === "number" ? count + (wasFollowing ? -1 : 1) : undefined;

    toggle(targetUserId, wasFollowing, {
      onOptimistic: () => {
        setIsFollowing(!wasFollowing);
        if (typeof optimisticCount === "number") {
          setCount(optimisticCount);
          onCountChange?.(optimisticCount);
        }
      },
      onRollback: () => {
        setIsFollowing(wasFollowing);
        if (typeof count === "number") {
          // 실제 count는 기존 상태로 되돌림
          setCount(count);
          onCountChange?.(count);
        }
      },
      refresh: false, // 목록/상단 카운터 등 외부에서 필요 시 별도 refresh
      onRequireLogin: onRequireLogin,
    });
  };

  return (
    <button
      type="button"
      aria-pressed={isFollowing}
      disabled={pending}
      onClick={handleClick}
      className={[
        "inline-flex items-center rounded-full transition-colors",
        size === "sm" ? "px-3 py-1 text-sm" : "px-4 py-2 text-sm",
        isFollowing
          ? "bg-neutral-200 dark:bg-neutral-700 text-neutral-900 dark:text-white hover:bg-neutral-300 dark:hover:bg-neutral-600"
          : "bg-indigo-600 text-white hover:bg-indigo-700",
        pending ? "opacity-60 cursor-not-allowed" : "",
        className,
      ].join(" ")}
    >
      <span>{nextLabel}</span>
      {typeof count === "number" && (
        <span className="ml-2 text-xs opacity-80">({count})</span>
      )}
    </button>
  );
}
