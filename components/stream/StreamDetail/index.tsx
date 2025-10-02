/**
 * File Name : components/stream/streamDetail/index
 * Description : 스트리밍 상세 메인 컴포넌트 (세부 UI 모듈화 포함)
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2024.11.19  임도헌   Created
 * 2024.11.19  임도헌   Modified  스트리밍 상세 컴포넌트 추가
 * 2024.11.21  임도헌   Modified  Link를 streams/[id]/page에서 StreamDetail로 옮김
 * 2024.11.21  임도헌   Modified  스트리밍 하기 위한 정보들 본인만 보이게 변경
 * 2024.12.07  임도헌   Modified  프로필 이미지 컴포넌트 분리
 * 2025.05.16  임도헌   Modified  UI 변경, 실시간 시청자 수 기능 추가
 * 2025.07.31  임도헌   Modified  분리된 세부 컴포넌트 통합 구성
 * 2025.08.23  임도헌   Modified  Cloudflare 플레이어 ENV 가드 추가, ENDED 오버레이 조건 명시
 * 2025.09.09  임도헌   Modified  ENV 변수 재사용 버그 수정, started_at 직렬화 가드, 중복 비교 정리
 * 2025.09.13  임도헌   Modified  iframe 자동재생 추가
 * 2025.09.15  임도헌   Modified  레이아웃 재배치: 제목→메타(시작시간+태그 한줄)→유저
 * 2025.09.16  임도헌   Modified  Broadcast 스키마 정렬(stream_id/stream_key optional)
 * 2025.09.17  임도헌   Modified  삭제 버튼을 녹화 페이지로 이동 (상세에서는 노출하지 않음)
 */

"use client";

import LiveStatusButton from "@/components/stream/StreamDetail/LiveStatusButton";
import TimeAgo from "@/components/common/TimeAgo";
import StreamEndedOverlay from "@/components/stream/StreamDetail/StreamEndedOverlay";
import StreamCategoryTags from "@/components/stream/StreamDetail/StreamCategoryTags";
import StreamDescription from "@/components/stream/StreamDetail/StreamDescription";
import StreamSecretInfo from "@/components/stream/StreamDetail/StreamSecretInfo";
import LiveViewerCount from "@/components/stream/StreamDetail/LiveViewerCount";
import StreamTitle from "@/components/stream/StreamDetail/StreamTitle";
import UserAvatar from "@/components/common/UserAvatar";
import type { StreamDetailDTO } from "@/lib/stream/getBroadcastDetail";

interface StreamDetailProps {
  stream: StreamDetailDTO;
  /** 현재 로그인 유저 id */
  me: number | null;
  /** Broadcast id */
  streamId: number;
}

export default function StreamDetail({
  stream,
  me,
  streamId,
}: StreamDetailProps) {
  const isOwner = !!me && stream.user.id === me;

  return (
    <div className="relative">
      {/* 우상단 실시간 시청자 수 */}
      <div className="absolute top-3 right-3 z-10">
        {me != null && <LiveViewerCount streamId={streamId} me={me} />}
      </div>

      {/* 라이브 상태 라벨 */}
      <LiveStatusButton status={stream.status} streamId={stream.stream_id} />

      {/* 플레이어 */}
      <div className="relative mb-4 aspect-video overflow-hidden rounded-xl bg-black">
        {(() => {
          const DOMAIN = process.env.NEXT_PUBLIC_CLOUDFLARE_STREAM_DOMAIN;
          if (!DOMAIN) {
            return (
              <div className="absolute inset-0 flex items-center justify-center px-4 text-center text-sm text-red-300">
                환경변수 <code>NEXT_PUBLIC_CLOUDFLARE_STREAM_DOMAIN</code>가
                설정되지 않았습니다.
              </div>
            );
          }
          const params = new URLSearchParams({
            autoplay: "1",
            muted: "1",
            preload: "auto",
          });
          const src = `${DOMAIN}/${stream.stream_id}/iframe?${params.toString()}`;
          return (
            <iframe
              title={`Live stream player • ${stream.title ?? stream.stream_id}`}
              className="absolute inset-0 h-full w-full"
              src={src}
              allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
              loading="lazy"
              allowFullScreen
            />
          );
        })()}
        {stream.status === "ENDED" && (
          <StreamEndedOverlay username={stream.user.username} />
        )}
      </div>

      {/* 제목 */}
      <StreamTitle title={stream.title} />

      {/* 메타 정보 */}
      <div
        className={`
          mb-3 flex flex-wrap items-center gap-2 text-xs text-neutral-600 dark:text-neutral-300
          [&>div]:mb-0 [&>div]:inline-flex
        `}
      >
        {/* 태그/카테고리 */}
        <StreamCategoryTags
          category={stream.category ?? undefined}
          tags={stream.tags ?? undefined}
        />

        {/* 시작 시간 */}
        {stream.started_at && (
          <span>
            시작: <TimeAgo date={stream.started_at} />
          </span>
        )}
      </div>

      {/* 유저 (아바타 + 이름) */}
      <div className="mb-3 flex items-center gap-3">
        <UserAvatar
          avatar={stream.user.avatar}
          username={stream.user.username}
        />
      </div>

      {/* 설명 */}
      <StreamDescription description={stream.description} />

      {/* 소유자 전용 정보 (키가 존재할 때만 표시) */}

      {isOwner && <StreamSecretInfo broadcastId={streamId} />}

      {/* 삭제 버튼은 녹화 페이지(Recording)에서만 노출 */}
    </div>
  );
}
