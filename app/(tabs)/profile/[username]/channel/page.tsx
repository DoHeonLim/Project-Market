/**
 * File Name : app/(tabs)/profile/[username]/channel/page
 * Description : 유저 방송국 페이지
 * Author : 임도헌
 *
 * History
 * 2025.05.16  임도헌   Created
 * 2025.08.09  임도헌   Modified  getUserStreams + role 적용(가시성 필터 적용)
 * 2025.08.26  임도헌   Modified  녹화본 requiresPassword/followersOnlyLocked 서버 계산 적용
 * 2025.08.27  임도헌   Modified  언락 상태 기반 requiresPassword 계산 + recordings 주입
 * 2025.08.27  임도헌   Modified  getUserStreams 결과에서 ENDED만 골라 간단 플래그 계산
 * 2025.09.08  임도헌   Modified  viewerFollowingIds 조회 후 클라이언트로 전달
 * 2025.09.12  임도헌   Modified  병렬화 및 소소한 타입/가드 정리
 * 2025.09.13  임도헌   Modified  unstable_cache 태그 적용 — 라이브 상태 갱신 전파
 * 2025.09.17  임도헌   Modified  캐시 태그 표준화(broadcast-list), VodAsset 단일 페이지 진입 반영
 * 2025.09.19  임도헌   Modified  getUserChannel 도입(리다이렉트 제거)
 * 2025.09.21  임도헌   Modified  모든 VOD 전개 + vodId 경로 주입
 */

import { notFound } from "next/navigation";
import { unstable_cache as nextCache } from "next/cache";
import getSession from "@/lib/session";
import db from "@/lib/db";
import { getUserStreams } from "@/lib/stream/getUserStreams";
import UserStreamsClient from "@/components/stream/UserStreamsClient";
import type { BroadcastSummary, VodForGrid } from "@/types/stream";
import { getIsFollowing, getUserChannel } from "./actions";

type Params = { username: string };
type Role = "OWNER" | "FOLLOWER" | "VISITOR";

export default async function ChannelPage({ params }: { params: Params }) {
  const username = decodeURIComponent(params.username);
  const session = await getSession();
  const viewerId = session?.id ?? null;

  // 1) 채널 소유자
  const userInfo = await getUserChannel(username);
  if (!userInfo?.id) return notFound();

  // 2) getUserStreams 캐시
  const viewerKey = `viewer-${viewerId ?? "anon"}`;
  const getUserStreamsCached = nextCache(
    (args: { username: string; viewerId: number | null }) =>
      getUserStreams(args),
    [`user-broadcasts-${userInfo.id}`, viewerKey],
    { tags: ["broadcast-list", `user-broadcasts-${userInfo.id}`] }
  );

  // 3) 병렬 조회
  const [streamsWithRole, isFollowing, viewerFollowingRows, viewerInfo] =
    await Promise.all([
      getUserStreamsCached({ username, viewerId }),
      viewerId ? getIsFollowing(viewerId, userInfo.id) : Promise.resolve(false),
      viewerId
        ? db.follow.findMany({
            where: { followerId: viewerId },
            select: { followingId: true },
          })
        : Promise.resolve([] as { followingId: number }[]),
      viewerId
        ? db.user.findUnique({
            where: { id: viewerId },
            select: { id: true, username: true, avatar: true },
          })
        : Promise.resolve(
            null as {
              id: number;
              username: string;
              avatar: string | null;
            } | null
          ),
    ]);

  const { items: userStreams, role } =
    streamsWithRole ?? ({ items: [], role: "VISITOR" } as const);

  const resolvedRole: Role = (role as Role) ?? "VISITOR";
  const streams = (userStreams ?? []) as BroadcastSummary[];
  const viewerFollowingIds = viewerFollowingRows.map((r) => r.followingId);

  // 4) ENDED 방송들의 모든 VOD 조회 → VOD 카드로 평탄화
  const endedBroadcasts = streams.filter((s) => s.status === "ENDED");
  const endedIds = endedBroadcasts.map((s) => s.id);

  let recordingsForGrid: VodForGrid[] = [];

  if (endedIds.length > 0) {
    const vods = await db.vodAsset.findMany({
      where: { broadcastId: { in: endedIds } },
      select: {
        id: true,
        broadcastId: true,
        thumbnail_url: true,
        duration_sec: true,
        ready_at: true,
        views: true,
      },
      orderBy: [{ ready_at: "desc" }, { created_at: "desc" }],
    });

    // broadcastId → 원본 방송(UserStream) 매핑
    const byBroadcast = new Map<number, BroadcastSummary>();
    for (const s of endedBroadcasts) byBroadcast.set(s.id, s);

    recordingsForGrid = vods.map((v) => {
      const rec = byBroadcast.get(v.broadcastId)!;
      const isFollowersOnly = rec.visibility === "FOLLOWERS";
      const requiresPassword =
        rec.visibility === "PRIVATE" && resolvedRole !== "OWNER";
      const followersOnlyLocked =
        isFollowersOnly &&
        !(resolvedRole === "OWNER" || resolvedRole === "FOLLOWER");

      return {
        vodId: v.id,
        broadcastId: v.broadcastId,
        title: rec.title,
        thumbnail: v.thumbnail_url ?? rec.thumbnail,
        visibility: rec.visibility,
        user: rec.user,
        href: `/streams/${v.id}/recording`,
        readyAt: v.ready_at ?? null,
        duration:
          typeof v.duration_sec === "number" ? v.duration_sec : undefined,
        viewCount: v.views ?? 0,
        requiresPassword,
        followersOnlyLocked,
      } satisfies VodForGrid;
    });
  }

  // 5) 렌더
  return (
    <UserStreamsClient
      userStreams={streams}
      recordings={recordingsForGrid}
      userInfo={{ ...userInfo, isFollowing }}
      me={resolvedRole === "OWNER"}
      viewerId={viewerId ?? undefined}
      viewerFollowingIds={viewerFollowingIds}
      viewerInfo={viewerInfo ?? undefined}
    />
  );
}
