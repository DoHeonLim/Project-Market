/**
 * File Name : components/follow/FollowSection
 * Description : 팔로워/팔로잉 표시 + (옵션) 팔로우 토글 + 모달 2종(공용)
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2025.10.13  임도헌   Created   프로필/채널/내 프로필 공용 Follow 섹션
 * 2025.10.22  임도헌   Modified  viewerInfo prop 제거 → 컨트롤러 내부에서 useUserLite(viewerId) 사용
 * 2025.10.29  임도헌   Modified  a11y(aria-pressed/aria-busy/aria-label) 보강
 * 2025.11.10  임도헌   Modified  props 정리(variant 제거, size/align 도입)
 */

"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import FollowListModal from "@/components/follow/FollowListModal";
import { useFollowController } from "@/hooks/useFollowController";

export type FollowSectionProps = {
  ownerId: number;
  ownerUsername: string;

  initial?: {
    isFollowing?: boolean;
    followerCount?: number;
    followingCount?: number;
  };

  viewer?: { id?: number | null };

  /** 기본 true, 단 viewer?.id === ownerId 면 내부에서 자동 false */
  showButton?: boolean;

  /** UI 크기 */
  size?: "regular" | "compact";

  /** 정렬 */
  align?: "start" | "center" | "end";

  className?: string;

  /** 로그인 필요시 호출(없으면 no-op; 페이지에서 라우팅 처리 권장) */
  onRequireLogin?: () => void;

  /** 외부에서 팔로잉 상태 변화를 듣고 싶을 때 */
  onFollowingChange?: (v: boolean) => void;
};

export default function FollowSection({
  ownerId,
  ownerUsername,
  initial,
  viewer,
  showButton = true,
  size = "compact",
  align = "start",
  className,
  onRequireLogin,
  onFollowingChange,
}: FollowSectionProps) {
  // self 판단 및 버튼 노출 규칙
  const viewerId = viewer?.id ?? undefined;
  const isSelf = viewerId != null && viewerId === ownerId;
  const resolvedShowButton = showButton && !isSelf;

  // 초기값 널 세이프
  const initIsFollowing = !!initial?.isFollowing;
  const initFollowerCount = initial?.followerCount ?? 0;
  const initFollowingCount = initial?.followingCount ?? 0;

  // 컨트롤러 훅
  const {
    isFollowing,
    followerCount,
    followingCount,
    isPending,
    openFollowers,
    openFollowing,
    onToggleFollow,
    followersList,
    followingList,
    onViewerFollowChange,
    toggleItem,
    isPendingById,
  } = useFollowController({
    ownerId,
    ownerUsername,
    initialIsFollowing: initIsFollowing,
    initialFollowerCount: initFollowerCount,
    initialFollowingCount: initFollowingCount,
    viewerId,
    onRequireLogin,
  });

  // 모달 로컬 상태
  const [followersOpen, setFollowersOpen] = useState(false);
  const [followingOpen, setFollowingOpen] = useState(false);

  const wrapOpenFollowers = useCallback(async () => {
    if (!viewerId) {
      onRequireLogin?.();
      return;
    }
    setFollowersOpen(true);
    await openFollowers();
  }, [viewerId, onRequireLogin, openFollowers]);

  const wrapOpenFollowing = useCallback(async () => {
    if (!viewerId) {
      onRequireLogin?.();
      return;
    }
    setFollowingOpen(true);
    await openFollowing();
  }, [viewerId, onRequireLogin, openFollowing]);

  // 외부로 팔로잉 상태 변화 알림
  useEffect(() => {
    onFollowingChange?.(isFollowing);
  }, [isFollowing, onFollowingChange]);

  // 스타일 토큰
  const sizes = useMemo(
    () =>
      size === "compact"
        ? { numCls: "text-sm", btnCls: "px-1 py-0.5 text-sm" }
        : { numCls: "text-base", btnCls: "px-1.5 py-0.5 text-base" },
    [size]
  );

  const alignCls = useMemo(
    () =>
      ({
        start: "items-start",
        center: "items-center",
        end: "items-end",
      })[align],
    [align]
  );

  return (
    <div
      className={[
        "flex",
        "gap-3",
        "flex-wrap",
        "items-center",
        alignCls,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      aria-label="팔로우 섹션"
    >
      {/* 숫자 버튼들 */}
      <button
        type="button"
        onClick={wrapOpenFollowers}
        aria-label={`팔로워 ${followerCount}명 보기`}
        className={`hover:text-primary dark:hover:text-primary-light text-neutral-500 dark:text-neutral-400 ${sizes.numCls}`}
      >
        팔로워 {followerCount.toLocaleString()}
      </button>

      <button
        type="button"
        onClick={wrapOpenFollowing}
        aria-label={`팔로잉 ${followingCount}명 보기`}
        className={`hover:text-primary dark:hover:text-primary-light text-neutral-500 dark:text-neutral-400 ${sizes.numCls}`}
      >
        팔로잉 {followingCount.toLocaleString()}
      </button>

      {/* 팔로우 토글 버튼(내 프로필이면 숨김) */}
      {resolvedShowButton && (
        <button
          type="button"
          onClick={onToggleFollow}
          disabled={isPending}
          aria-pressed={isFollowing}
          aria-busy={isPending}
          className={[
            "rounded-lg shadow transition-colors whitespace-nowrap",
            sizes.btnCls,
            isFollowing
              ? "bg-neutral-200 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-300 dark:hover:bg-neutral-600"
              : "bg-primary text-white hover:bg-primary/90",
          ].join(" ")}
        >
          {isPending ? "처리 중..." : isFollowing ? "팔로잉 취소" : "팔로우"}
        </button>
      )}

      {/* 모달: 팔로워 */}
      <FollowListModal
        isOpen={followersOpen}
        onClose={() => setFollowersOpen(false)}
        users={followersList.users}
        title="팔로워"
        kind="followers"
        viewerId={viewerId}
        onViewerFollowChange={onViewerFollowChange}
        isLoading={!followersList.loaded && followersList.loading}
        hasMore={followersList.hasMore}
        onLoadMore={followersList.loadMore}
        loadingMore={followersList.loading && followersList.loaded}
        onToggleItem={toggleItem}
        isPendingById={isPendingById}
      />

      {/* 모달: 팔로잉 */}
      <FollowListModal
        isOpen={followingOpen}
        onClose={() => setFollowingOpen(false)}
        users={followingList.users}
        title="팔로잉"
        kind="following"
        viewerId={viewerId}
        onViewerFollowChange={onViewerFollowChange}
        isLoading={!followingList.loaded && followingList.loading}
        hasMore={followingList.hasMore}
        onLoadMore={followingList.loadMore}
        loadingMore={followingList.loading && followingList.loaded}
        onToggleItem={toggleItem}
        isPendingById={isPendingById}
      />
    </div>
  );
}
