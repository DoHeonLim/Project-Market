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
 */

"use client";

import { useEffect, useMemo, useState } from "react";
import FollowListModal from "@/components/follow/FollowListModal";
import { useFollowController } from "@/hooks/useFollowController";

type Variant = "compact" | "regular"; // 채널 헤더=compact, 프로필=regular 처럼

type Props = {
  ownerId: number;
  ownerUsername: string;

  initialIsFollowing: boolean;
  initialFollowerCount: number;
  initialFollowingCount: number;

  viewerId?: number;
  showFollowButton?: boolean; // 내 프로필이면 false
  variant?: Variant;
  className?: string;
  onRequireLogin?: () => void;
  onFollowingChange?: (v: boolean) => void;
};

export default function FollowSection({
  ownerId,
  ownerUsername,
  initialIsFollowing,
  initialFollowerCount,
  initialFollowingCount,
  viewerId,
  showFollowButton = true,
  variant = "regular",
  className,
  onRequireLogin,
  onFollowingChange,
}: Props) {
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
    initialIsFollowing,
    initialFollowerCount,
    initialFollowingCount,
    viewerId,
    onRequireLogin,
  });

  const [followersOpen, setFollowersOpen] = useState(false);
  const [followingOpen, setFollowingOpen] = useState(false);

  const wrapOpenFollowers = async () => {
    if (!viewerId) {
      onRequireLogin?.(); // 토스트/모달 등
      return;
    }
    setFollowersOpen(true);
    await openFollowers();
  };

  const wrapOpenFollowing = async () => {
    if (!viewerId) {
      onRequireLogin?.();
      return;
    }
    setFollowingOpen(true);
    await openFollowing();
  };

  useEffect(() => {
    onFollowingChange?.(isFollowing);
  }, [isFollowing, onFollowingChange]);

  const sizes = useMemo(() => {
    return variant === "compact"
      ? { numCls: "text-sm", btnCls: "px-3 py-1.5 text-sm" }
      : { numCls: "text-base", btnCls: "px-5 py-2 text-base" };
  }, [variant]);

  return (
    <div
      className={["flex items-center gap-3", className]
        .filter(Boolean)
        .join(" ")}
    >
      {/* 숫자 버튼들 */}
      <button
        type="button"
        onClick={wrapOpenFollowers}
        aria-label={`팔로워 ${followerCount}명 보기`}
        className={`hover:text-primary dark:hover:text-primary-light text-neutral-500 dark:text-neutral-400 ${sizes.numCls}`}
      >
        팔로워 {followerCount}
      </button>
      <button
        type="button"
        onClick={wrapOpenFollowing}
        aria-label={`팔로잉 ${followingCount}명 보기`}
        className={`hover:text-primary dark:hover:text-primary-light text-neutral-500 dark:text-neutral-400 ${sizes.numCls}`}
      >
        팔로잉 {followingCount}
      </button>

      {/* 팔로우 토글 버튼(옵션) */}
      {showFollowButton && (
        <button
          type="button"
          onClick={onToggleFollow}
          disabled={isPending}
          aria-pressed={isFollowing}
          aria-busy={isPending}
          className={[
            "rounded-lg shadow transition-colors",
            sizes.btnCls,
            isFollowing
              ? "bg-neutral-200 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-300 dark:hover:bg-neutral-600"
              : "bg-primary text-white hover:bg-primary/90",
          ].join(" ")}
        >
          {isPending ? "처리 중..." : isFollowing ? "팔로우 취소" : "팔로우"}
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
        onToggleItem={toggleItem} // ⬅ 주입
        isPendingById={isPendingById} // ⬅ 주입
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
        onToggleItem={toggleItem} // ⬅ 주입
        isPendingById={isPendingById} // ⬅ 주입
      />
    </div>
  );
}
