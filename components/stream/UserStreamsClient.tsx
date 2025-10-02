/**
 * File Name : components/stream/UserStreamsClient
 * Description : 유저 방송국 client
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2025.05.16  임도헌   Created
 * 2025.05.16  임도헌   Modified  유저 방송국 client 컴포넌트
 * 2025.05.22  임도헌   Modified  팔로우 기능 추가
 * 2025.08.09  임도헌   Modified  기능별 컴포넌트 분리
 * 2025.09.08  임도헌   Modified  useFollowToggle 사용 + viewerId/viewerFollowingIds 전달
 * 2025.09.14  임도헌   Modified  a11y/UX 보강(Esc 닫기, 포커스 관리, 스크롤 잠금, 스크롤 영역 일관화)
 * 2025.09.19  임도헌   Modified  getUserChannel 경량화에 맞춰 팔로워/팔로잉 모달 지연 로드(lazy-load) 적용
 * 2025.09.19  임도헌   Modified  유저 팔로우, 팔로잉 무한스크롤 기능 추가
 */
"use client";

import { useCallback, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import FollowListModal from "@/components/follow/FollowListModal";
import UserChannelHeader from "@/components/stream/channel/UserChannelHeader";
import LiveNowHero from "@/components/stream/channel/LiveNowHero";
import RecordingGrid from "@/components/stream/channel/RecordingGrid";

import type { BroadcastSummary, UserInfo, VodForGrid } from "@/types/stream";
import { useFollowToggle } from "@/hooks/useFollowToggle";
import { listFollowers, listFollowing } from "@/app/(tabs)/profile/actions";
import LiveStatusRealtimeSubscriber from "../stream/LiveStatusRealtimeSubscriber";

// 모달 목록 지연 로드를 위한 서버 액션

/** 역할 정의 */
type Role = "OWNER" | "FOLLOWER" | "VISITOR";

type ExtendedUserInfo = {
  id: number;
  username: string;
  avatar?: string | null;
  isFollowing?: boolean;
  _count?: { followers?: number; following?: number };
};

type MeProp = boolean | { id: number } | undefined;

export default function UserStreamsClient({
  userStreams,
  recordings,
  liveNow,
  userInfo,
  me,
  viewerId,
  viewerFollowingIds = [],
  viewerInfo,
}: {
  userStreams?: BroadcastSummary[];
  recordings?: VodForGrid[];
  liveNow?: BroadcastSummary | null;
  userInfo: ExtendedUserInfo;
  me?: MeProp;
  viewerId?: number;
  viewerFollowingIds?: number[];
  viewerInfo?: { id: number; username: string; avatar?: string | null };
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const next = useMemo(
    () => pathname + (searchParams.size ? `?${searchParams.toString()}` : ""),
    [pathname, searchParams]
  );
  const { toggle, isPending } = useFollowToggle();

  // isMe/role
  const isMe =
    typeof me === "boolean"
      ? me
      : !!(me && "id" in me && me.id === userInfo.id);
  const [isFollowing, setIsFollowing] = useState<boolean>(
    !!userInfo.isFollowing
  );
  const role: Role = isMe ? "OWNER" : isFollowing ? "FOLLOWER" : "VISITOR";

  // 팔로워/팔로잉 모달 상태 & 채널 주인의 팔로워 카운트
  const [isFollowersModalOpen, setIsFollowersModalOpen] = useState(false);
  const [isFollowingModalOpen, setIsFollowingModalOpen] = useState(false);
  const [followerCount, setFollowerCount] = useState<number>(
    userInfo._count?.followers ?? 0
  );
  const [followingCount, setFollowingCount] = useState<number>(
    userInfo._count?.following ?? 0
  );

  // 모달 목록(지연 로드)
  const [followersUsers, setFollowersUsers] = useState<UserInfo[]>([]);
  const [followingUsers, setFollowingUsers] = useState<UserInfo[]>([]);
  const [followersLoaded, setFollowersLoaded] = useState(false);
  const [followingLoaded, setFollowingLoaded] = useState(false);
  const [followersLoading, setFollowersLoading] = useState(false);
  const [followingLoading, setFollowingLoading] = useState(false);
  const [followersCursor, setFollowersCursor] = useState<number | null>(null);
  const [followingCursor, setFollowingCursor] = useState<number | null>(null);

  const openFollowers = useCallback(async () => {
    setIsFollowersModalOpen(true);
    if (!followersLoaded) {
      setFollowersLoading(true);
      const res = await listFollowers(userInfo.username, null);
      setFollowersUsers(res.users);
      setFollowersCursor(res.nextCursor);
      setFollowersLoaded(true);
      setFollowersLoading(false);
    }
  }, [followersLoaded, userInfo.username]);

  const openFollowing = useCallback(async () => {
    setIsFollowingModalOpen(true);
    if (!followingLoaded) {
      setFollowingLoading(true);
      const res = await listFollowing(userInfo.username, null);
      setFollowingUsers(res.users);
      setFollowingCursor(res.nextCursor);
      setFollowingLoaded(true);
      setFollowingLoading(false);
    }
  }, [followingLoaded, userInfo.username]);

  // 더 불러오기 (dedup 포함)
  const loadMoreFollowers = useCallback(async () => {
    if (followersLoading || !followersCursor) return;
    setFollowersLoading(true);
    const res = await listFollowers(userInfo.username, followersCursor);
    setFollowersUsers((prev) => {
      const map = new Map(prev.map((u) => [u.id, u]));
      for (const u of res.users) map.set(u.id, u);
      return Array.from(map.values());
    });
    setFollowersCursor(res.nextCursor);
    setFollowersLoading(false);
  }, [followersCursor, followersLoading, userInfo.username]);

  const loadMoreFollowing = useCallback(async () => {
    if (followingLoading || !followingCursor) return;
    setFollowingLoading(true);
    const res = await listFollowing(userInfo.username, followingCursor);
    setFollowingUsers((prev) => {
      const map = new Map(prev.map((u) => [u.id, u]));
      for (const u of res.users) map.set(u.id, u);
      return Array.from(map.values());
    });
    setFollowingCursor(res.nextCursor);
    setFollowingLoading(false);
  }, [followingCursor, followingLoading, userInfo.username]);

  // 라이브/녹화 분리
  const liveStream = useMemo<BroadcastSummary | undefined>(() => {
    if (liveNow) return liveNow || undefined;
    if (Array.isArray(userStreams))
      return userStreams.find((s) => s.status === "CONNECTED");
    return undefined;
  }, [liveNow, userStreams]);

  const recordingsMemo = useMemo(() => recordings ?? [], [recordings]);

  // 1) 뷰어의 팔로잉 Set 로컬 상태
  const [viewerFollowingSet, setViewerFollowingSet] = useState<Set<number>>(
    () => new Set(viewerFollowingIds)
  );

  // 2) 모달에서 상향 콜백으로 들어오는 토글 결과를 Set에 즉시 반영
  const handleViewerFollowChange = useCallback(
    (targetUserId: number, now: boolean) => {
      setViewerFollowingSet((prev) => {
        const next = new Set(prev);
        if (now) next.add(targetUserId);
        else next.delete(targetUserId);
        return next;
      });
    },
    []
  );

  const handleViewerFollowingChange = useCallback(
    (targetUserId: number, now: boolean) => {
      setViewerFollowingSet((prev) => {
        const next = new Set(prev);
        if (now) next.add(targetUserId);
        else next.delete(targetUserId);
        return next;
      });
      setFollowingCount((c) => Math.max(0, c + (now ? +1 : -1)));
    },
    []
  );

  // 헤더 팔로우 토글: 로컬 상태(팔로잉 Set, 카운트 & 모달 목록)까지 낙관 갱신
  const onToggleFollow = async () => {
    const was = isFollowing;

    await toggle(userInfo.id, was, {
      refresh: false,
      onOptimistic: () => setIsFollowing(!was),
      onRollback: () => setIsFollowing(was),
      onRequireLogin: () =>
        router.push(`/login?next=${encodeURIComponent(next)}`),
      onFollowersChange: (change) => {
        setFollowerCount((c) => Math.max(0, c + change));
        if (viewerId && followersLoaded) {
          setFollowersUsers((prev) => {
            const exists = prev.some((u) => u.id === viewerId);
            if (change > 0 && !exists) {
              const v =
                viewerInfo ??
                ({ id: viewerId, username: "(나)", avatar: null } as UserInfo);
              return [v, ...prev];
            }
            if (change < 0 && exists)
              return prev.filter((u) => u.id !== viewerId);
            return prev;
          });
        }
      },
    });
  };

  return (
    <div className="pb-10">
      {/* 라이브 상태 변경 즉시 새로고침 */}
      <LiveStatusRealtimeSubscriber />

      <UserChannelHeader
        username={userInfo.username}
        avatar={userInfo.avatar}
        followerCount={followerCount}
        followingCount={followingCount}
        isMe={isMe}
        isFollowing={isFollowing}
        onToggleFollow={onToggleFollow}
        onOpenFollowers={openFollowers}
        onOpenFollowing={openFollowing}
        isPending={isPending(userInfo.id)}
      />

      <LiveNowHero stream={liveStream} role={role} onFollow={onToggleFollow} />

      <RecordingGrid
        recordings={recordingsMemo}
        role={role}
        isFollowing={isFollowing}
        onFollow={onToggleFollow}
      />

      {/* 팔로워 모달 */}
      <FollowListModal
        isOpen={isFollowersModalOpen}
        onClose={() => setIsFollowersModalOpen(false)}
        users={followersUsers}
        title="팔로워"
        viewerId={viewerId}
        viewerFollowingIds={[...viewerFollowingSet]}
        onViewerFollowChange={handleViewerFollowChange}
        isLoading={followersLoading}
        hasMore={!!followersCursor}
        onLoadMore={loadMoreFollowers}
        loadingMore={followersLoading && followersLoaded}
      />

      {/* 팔로잉 모달 */}
      <FollowListModal
        isOpen={isFollowingModalOpen}
        onClose={() => setIsFollowingModalOpen(false)}
        users={followingUsers}
        title="팔로잉"
        viewerId={viewerId}
        viewerFollowingIds={[...viewerFollowingSet]}
        onViewerFollowChange={handleViewerFollowingChange}
        isLoading={followingLoading}
        hasMore={!!followingCursor}
        onLoadMore={loadMoreFollowing}
        loadingMore={followingLoading && followingLoaded}
      />
    </div>
  );
}
