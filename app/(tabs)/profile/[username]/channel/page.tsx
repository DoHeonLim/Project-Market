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
 * 2025.10.06  임도헌   Modified  BroadcastSummary 타입 단언 수정
 */

import { notFound } from "next/navigation";
import getSession from "@/lib/session";
import db from "@/lib/db";
import UserStreamsClient from "@/components/stream/UserStreamsClient";
import { getUserStreams } from "@/lib/stream/getUserStreams";
import { getIsFollowing } from "@/lib/user/follow/getIsFollowing";
import { getUserChannel } from "@/lib/user/getUserChannel";
import type { BroadcastSummary, ViewerRole, VodForGrid } from "@/types/stream";

type Params = { username: string };

export default async function ChannelPage({ params }: { params: Params }) {
  const username = decodeURIComponent(params.username);
  const session = await getSession();
  const viewerId = session?.id ?? null;

  // 1) 채널 소유자
  const userInfo = await getUserChannel(username);
  if (!userInfo?.id) return notFound();

  const ownerId = userInfo.id;

  // 2) 병렬 조회
  const [streamsWithRole, isFollowing] = await Promise.all([
    getUserStreams({ ownerId, viewerId, take: 30 }),
    viewerId ? getIsFollowing(viewerId, ownerId) : Promise.resolve(false),
  ]);

  const { items: userStreams = [], role = "VISITOR" } = streamsWithRole ?? {};
  const resolvedRole = role as ViewerRole;

  // BroadcastSummary 타입 단언 수정
  const streams: BroadcastSummary[] = userStreams ?? [];

  // 3) ENDED 방송들의 모든 VOD 조회 → VOD 카드로 평탄화
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
    />
  );
}
