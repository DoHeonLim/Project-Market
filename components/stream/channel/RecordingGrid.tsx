/**
 * File Name : components/stream/channel/RecordingGrid
 * Description : 다시보기 2열 그리드 (FOLLOWERS Teaser 포함) - StreamCard 재사용
 * Author : 임도헌
 *
 * History
 * 2025.08.09  임도헌   Created   다시보기 그리드 분리
 * 2025.08.14  임도헌   Modified  썸네일 URL 정규화 + StreamCard 재사용
 * 2025.08.26  임도헌   Modified  서버 계산 플래그 우선 적용
 * 2025.08.27  임도헌   Modified  unlock 타깃 streamId 우선 전달
 * 2025.09.05  임도헌   Modified  (보강) unlock 타깃 streamId 우선 전달 로직 명시 + 불리언 캐스팅
 * 2025.09.13  임도헌   Modified  ended_at 우선 노출, TimeAgo에 Date 직접 전달, 반응형 1/2열
 * 2025.09.21  임도헌   Modified  카드 key를 vodId 기반으로, href 전달로 vodId 경로 사용
 * 2025.09.22  임도헌   Modified  VodForGrid(readyAt/duration/viewCount) 기준으로 정리
 * 2025.11.23  임도헌   Modified  StreamCard layout(grid) 명시 및 카드 래퍼 정리,
 *                                다시보기 메타 영역(길이/조회수) 높이 일관화
 */
"use client";

import StreamCard from "@/components/stream/StreamCard";
import TimeAgo from "@/components/common/TimeAgo";
import { formatDuration } from "@/lib/utils";
import type { VodForGrid } from "@/types/stream";
import RecordingEmptyState from "./RecordingEmptyState";

type Role = "OWNER" | "FOLLOWER" | "VISITOR";

interface Props {
  recordings: VodForGrid[]; // VOD 중심 (readyAt/duration/viewCount 포함)
  role: Role;
  isFollowing: boolean;
  onFollow?: () => void;
}

export default function RecordingGrid({
  recordings,
  role,
  isFollowing,
  onFollow,
}: Props) {
  return (
    <div className="mx-auto max-w-3xl px-4 mt-8">
      <h2 className="text-black dark:text-white text-lg font-semibold mb-3">
        다시보기
      </h2>

      {recordings.length === 0 ? (
        <RecordingEmptyState
          role={role}
          isFollowing={isFollowing}
          onFollow={onFollow}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {recordings.map((rec) => {
            // 표시 시간 = readyAt (없으면 생략)
            const when = rec.readyAt ?? null;

            // 길이
            const hasDuration =
              typeof rec.duration === "number" && rec.duration > 0;

            // 조회수
            const hasViews =
              typeof rec.viewCount === "number" && rec.viewCount >= 0;

            const isFollowersOnly = rec.visibility === "FOLLOWERS";
            const followersOnlyLocked =
              typeof rec.followersOnlyLocked === "boolean"
                ? rec.followersOnlyLocked
                : isFollowersOnly && role === "VISITOR";

            const requiresPassword =
              typeof rec.requiresPassword === "boolean"
                ? rec.requiresPassword
                : rec.visibility === "PRIVATE" && role !== "OWNER";

            // unlock 타깃 = 부모 Broadcast id
            const unlockTargetId = rec.broadcastId;

            // 상세 경로: 없으면 vodId로 폴백
            const href = rec.href ?? `/streams/${rec.vodId}/recording`;

            // key = vodId
            const key = `vod-${rec.vodId}`;

            return (
              <div key={key} className="rounded-xl overflow-hidden shadow">
                <StreamCard
                  id={unlockTargetId}
                  title={rec.title}
                  thumbnail={rec.thumbnail}
                  isLive={false}
                  streamer={{
                    username: rec.user.username,
                    avatar: rec.user.avatar ?? null,
                  }}
                  href={href}
                  requiresPassword={!!requiresPassword}
                  isFollowersOnly={!!isFollowersOnly}
                  followersOnlyLocked={!!followersOnlyLocked}
                  onRequestFollow={followersOnlyLocked ? onFollow : undefined}
                  isPrivateType={rec.visibility === "PRIVATE"}
                  layout="grid" // 기본값이라 생략 가능
                />

                {(when || hasDuration || hasViews) && (
                  <div className="p-2">
                    <div className="text-[11px] text-neutral-500 dark:text-neutral-400">
                      {when ? <TimeAgo date={when} /> : null}
                      {when && (hasDuration || hasViews) ? " • " : ""}

                      {hasDuration ? formatDuration(rec.duration!) : null}
                      {hasDuration && hasViews ? " • " : ""}

                      {hasViews
                        ? `조회수 ${rec.viewCount!.toLocaleString()}`
                        : null}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
