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
 */

"use client";

import { useEffect, useState } from "react";
import UserAvatar from "@/components/common/UserAvatar";
import { useFollowToggle } from "@/hooks/useFollowToggle";
import type { UserInfo } from "@/types/stream";

interface FollowListItemProps {
  user: UserInfo;
  viewerId?: number;
  isFollowing: boolean; // 부모(모달)의 Set 기반
  onChange?: (nowFollowing: boolean) => void; // 부모 Set 갱신 콜백
  showButton?: boolean; // 기본 true
  buttonVariant?: "primary" | "outline";
  buttonSize?: "sm" | "md";
}

export default function FollowListItem({
  user,
  viewerId,
  isFollowing,
  onChange,
  showButton = true,
  buttonVariant = "outline",
  buttonSize = "sm",
}: FollowListItemProps) {
  const { toggle, isPending } = useFollowToggle();

  // 로컬 버튼 표시용 상태 (prop과 동기화)
  const [following, setFollowing] = useState<boolean>(isFollowing);
  useEffect(() => setFollowing(isFollowing), [isFollowing]);

  const isMe = viewerId != null && user.id === viewerId; // 안전 불리언
  const pending = isPending(user.id);

  const onToggle = async () => {
    const was = following;
    await toggle(user.id, was, {
      refresh: false,
      onOptimistic: () => {
        setFollowing(!was);
        onChange?.(!was);
      },
      onRollback: () => {
        setFollowing(was);
        onChange?.(was);
      },
    });
  };

  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-3">
        <UserAvatar username={user.username} avatar={user.avatar} size="sm" />
      </div>

      {/* 자기 자신은 버튼 숨김 */}
      {showButton && !isMe && (
        <button
          type="button"
          title={following ? "팔로우 취소" : "팔로우"}
          onClick={onToggle}
          disabled={pending}
          aria-pressed={following}
          aria-busy={pending || undefined}
          aria-label={
            pending
              ? "처리 중"
              : following
                ? `${user.username} 팔로우 취소`
                : `${user.username} 팔로우`
          }
          className={[
            "rounded-md px-3 py-1.5 transition-colors disabled:opacity-60 disabled:cursor-not-allowed",
            buttonSize === "sm" ? "text-sm" : "text-base",
            following
              ? "bg-neutral-200 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-300 dark:hover:bg-neutral-600"
              : buttonVariant === "primary"
                ? "bg-primary text-white hover:bg-primary/90"
                : "border border-neutral-300 dark:border-neutral-600 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-700",
          ].join(" ")}
        >
          {pending ? "처리 중..." : following ? "팔로우 취소" : "팔로우"}
        </button>
      )}

      {/* 자기 자신이면 '나' 배지 */}
      {isMe && (
        <span className="rounded bg-neutral-200 px-2 py-1 text-xs text-neutral-700 dark:bg-neutral-700 dark:text-neutral-200">
          나
        </span>
      )}
    </div>
  );
}
