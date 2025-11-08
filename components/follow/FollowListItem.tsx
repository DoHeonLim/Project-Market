/**
 * File Name : components/follow/FollowListItem
 * Description : 팔로우 리스트 아이템 (토글/낙관 갱신/자기 자신 숨김)
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2025.05.22  임도헌   Created
 * 2025.09.08  임도헌   Modified  useFollowToggle + onChange 콜백 연동
 * 2025.09.14  임도헌   Modified  username 출력/말줄임, a11y(aria-pressed/busy/label) 보강, isMe 불리언 가드
 * 2025.10.12  임도헌   Modified  타입 FollowListUser로 변경
 * 2025.10.14  임도헌   Modified  토글/로딩 상태를 FollowSection(=useFollowController) 한곳에서 관리하도록 수정
 * 2025.10.29  임도헌   Modified  a11y 상태 강화(aria-pressed/busy/label), 이름 말줄임/최대폭 보강
 */

"use client";

import { useEffect, useState, useMemo } from "react";
import UserAvatar from "@/components/common/UserAvatar";
import type { FollowListUser } from "@/types/profile";

type ToggleHandlers = { onOptimistic: () => void; onRollback: () => void };

interface FollowListItemProps {
  user: FollowListUser;
  viewerId?: number;
  isFollowing: boolean; // 부모가 내려주는 현재 상태
  onChange?: (user: FollowListUser, now: boolean) => void; // 상향 콜백(유지)
  onToggle?: (
    user: FollowListUser,
    was: boolean,
    h: ToggleHandlers
  ) => Promise<void>;
  pending?: boolean;
  showButton?: boolean;
  buttonVariant?: "primary" | "outline";
  buttonSize?: "sm" | "md";
  /** (옵션) 접근성 프롭 상향 주입 */
  a11yProps?: React.ButtonHTMLAttributes<HTMLButtonElement>;
}

export default function FollowListItem({
  user,
  viewerId,
  isFollowing,
  onChange,
  onToggle,
  pending = false,
  showButton = true,
  buttonVariant = "outline",
  buttonSize = "sm",
  a11yProps,
}: FollowListItemProps) {
  const [following, setFollowing] = useState(isFollowing);
  useEffect(() => setFollowing(isFollowing), [isFollowing]);

  const isMe = viewerId != null && user.id === viewerId;

  const sizes = useMemo(
    () => ({
      btn: buttonSize === "sm" ? "text-sm px-3 py-1.5" : "text-base px-4 py-2",
    }),
    [buttonSize]
  );

  const handleClick = async () => {
    const was = following;
    await onToggle?.(user, was, {
      onOptimistic: () => {
        setFollowing(!was);
        onChange?.(user, !was);
      },
      onRollback: () => {
        setFollowing(was);
        onChange?.(user, was);
      },
    });
  };

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
          aria-pressed={following}
          aria-busy={pending}
          aria-label={
            pending
              ? "팔로우 처리 중"
              : following
                ? "팔로우 취소"
                : "팔로우 하기"
          }
          className={[
            "rounded-md transition-colors disabled:opacity-60 disabled:cursor-not-allowed",
            sizes.btn,
            following
              ? "bg-neutral-200 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-300 dark:hover:bg-neutral-600"
              : buttonVariant === "primary"
                ? "bg-primary text-white hover:bg-primary/90"
                : "border border-neutral-300 dark:border-neutral-600 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-700",
          ].join(" ")}
          {...a11yProps}
        >
          {pending ? "처리 중..." : following ? "팔로우 취소" : "팔로우"}
        </button>
      ) : (
        <span
          className="rounded bg-neutral-200 px-2 py-1 text-xs text-neutral-700 dark:bg-neutral-700 dark:text-neutral-200"
          aria-label="내 계정"
          title="내 계정"
        >
          나
        </span>
      )}
    </div>
  );
}
