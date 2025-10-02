/**
 * File Name : app/streams/[id]/recording/page
 * Description : 라이브 스트리밍 녹화본 페이지 (Broadcast × VodAsset)
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2024.11.19  임도헌   Created
 * 2024.11.19  임도헌   Modified  라이브 스트리밍 녹화본 페이지 추가
 * 2024.11.21  임도헌   Modified  console.log 삭제
 * 2024.12.07  임도헌   Modified  프로필 이미지 컴포넌트 분리
 * 2024.12.12  임도헌   Modified  녹화본 생성 시간 표시 변경
 * 2025.08.04  임도헌   Modified  댓글 UI 추가
 * 2025.08.09  임도헌   Modified  접근 가드(403) 적용
 * 2025.09.05  임도헌   Modified  dynamic="force-dynamic" 적용 — 언락/팔로우 직후 녹화 페이지 접근 가드의 캐시 오판 방지
 * 2025.09.10  임도헌   Modified  로그인 가드 제거(미들웨어 신뢰), 변수명/타이핑/동시성 소폭 개선
 * 2025.09.20  임도헌   Modified  Broadcast/VodAsset 스키마로 전면 전환 (좋아요/댓글을 VodAsset 단위로)
 * 2025.09.20  임도헌   Modified  라우트 파라미터를 vodId로 고정
 */
export const dynamic = "force-dynamic";

import { notFound, redirect } from "next/navigation";
import getSession from "@/lib/session";

import RecordingDetail from "@/components/stream/recording/recordingDetail";
import RecordingComment from "@/components/stream/recording/recordingComment/RecordingComment";
import RecordingDeleteButton from "@/components/stream/recording/recordingDetail/RecordingDeleteButton";

import { getRecordingLikeStatus } from "@/app/streams/[id]/recording/actions/likes";
import { checkBroadcastAccess } from "@/lib/stream/checkBroadcastAccess";
import { isBroadcastUnlocked } from "@/lib/stream/unlockPrivateBroadcast";
import { incrementVodView } from "./actions/views";
import { getVodDetail } from "@/lib/stream/getVodDetail";

export default async function RecordingVodPage({
  params,
}: {
  params: { id: string };
}) {
  const vodId = Number(params.id);
  if (!Number.isFinite(vodId)) return notFound();

  const session = await getSession();
  const viewerId = session?.id ?? null;

  // 1) 가드용 1차 조회
  const base = await getVodDetail(vodId);
  if (!base) return notFound();

  const broadcastId = base.broadcast.id;
  const owner = base.broadcast.owner;

  // 2) 접근 가드
  const isOwner = !!viewerId && viewerId === owner.id;
  if (!isOwner) {
    const unlocked = await isBroadcastUnlocked(broadcastId);
    const guard = await checkBroadcastAccess(
      { userId: owner.id, visibility: base.broadcast.visibility },
      viewerId,
      { isPrivateUnlocked: unlocked }
    );
    if (!guard.allowed) {
      const next = encodeURIComponent(`/streams/${vodId}/recording`);
      redirect(
        `/403?reason=${guard.reason}&username=${encodeURIComponent(
          owner.username
        )}&next=${next}&sid=${broadcastId}`
      );
    }
  }

  // 3) 조회수 증가(실패 무시) → 4) 재조회
  try {
    await incrementVodView(vodId);
  } catch (e) {
    console.error("[incrementVodView] failed:", e);
  }

  const vod = await getVodDetail(vodId);
  if (!vod) return notFound();

  // 5) 좋아요 상태
  const like = await getRecordingLikeStatus(vodId, viewerId);

  // 표시값 정규화: readyAt 우선
  const created = new Date((vod.readyAt ?? vod.createdAt) as Date);
  const durationSec = Math.round(vod.durationSec ?? 0);

  return (
    <div className="flex flex-col items-center justify-center gap-6 overflow-y-auto scrollbar">
      <div className="mt-4 text-4xl font-semibold text-black dark:text-white">
        녹화본
      </div>

      <RecordingDetail
        broadcast={vod.broadcast}
        vodId={vodId}
        uid={vod.uid}
        duration={durationSec}
        created={created}
        isLiked={like.isLiked}
        likeCount={like.likeCount}
        commentCount={vod.counts.comments}
        viewCount={vod.views ?? 0}
      />

      {isOwner && (
        <div className="w-full max-w-3xl px-4">
          <RecordingDeleteButton
            broadcastId={vod.broadcast.id}
            liveInputUid={vod.broadcast.stream_id}
            username={vod.broadcast.owner.username}
          />
        </div>
      )}

      <RecordingComment vodId={vodId} currentUserId={session.id!} />
    </div>
  );
}
