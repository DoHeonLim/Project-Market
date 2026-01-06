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
 * 2025.10.05  임도헌   Modified  follow관련 함수 이름 변경(listFollowers -> fetchFollowers, listFollowing -> fetchFollowing)
 * 2025.10.14  임도헌   Modified  FollowSection 도입: 팔로우/모달/페이지네이션 로직 제거
 * 2026.01.06  임도헌   Modified  팔로우 용어/SSOT 정리: 모달 row는 isFollowedByViewer, 섹션 분리는 isMutualWithOwner(owner 기준)
 * 2025.01.06  임도헌   Modified  LiveNowHero에 onFollow 연결
 */
"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import UserChannelHeader from "@/components/stream/channel/UserChannelHeader";
import LiveNowHero from "@/components/stream/channel/LiveNowHero";
import RecordingGrid from "@/components/stream/channel/RecordingGrid";

import type { BroadcastSummary, ViewerRole, VodForGrid } from "@/types/stream";

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
}: {
  userStreams?: BroadcastSummary[];
  recordings?: VodForGrid[];
  liveNow?: BroadcastSummary | null;
  userInfo: ExtendedUserInfo;
  me?: MeProp;
  viewerId?: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const next = useMemo(
    () => pathname + (searchParams.size ? `?${searchParams.toString()}` : ""),
    [pathname, searchParams]
  );

  // 본인 여부 및 팔로우 상태(초기값)
  const isMe =
    typeof me === "boolean"
      ? me
      : !!(me && "id" in me && me.id === userInfo.id);

  const [isFollowing, setIsFollowing] = useState<boolean>(
    !!userInfo.isFollowing
  );

  // 채널용 역할 계산 (isFollowing이 바뀌면 재계산)
  const role: ViewerRole = isMe
    ? "OWNER"
    : isFollowing
      ? "FOLLOWER"
      : "VISITOR";

  // 라이브/녹화 메모
  const liveStream = useMemo<BroadcastSummary | undefined>(() => {
    if (liveNow) return liveNow || undefined;
    if (Array.isArray(userStreams))
      return userStreams.find((s) => s.status === "CONNECTED");
    return undefined;
  }, [liveNow, userStreams]);

  const recordingsMemo = useMemo(() => recordings ?? [], [recordings]);

  return (
    <div className="pb-10">
      {/* 헤더: FollowSection 포함 */}
      <UserChannelHeader
        ownerId={userInfo.id}
        username={userInfo.username}
        avatar={userInfo.avatar}
        initialFollowerCount={userInfo._count?.followers ?? 0}
        initialFollowingCount={userInfo._count?.following ?? 0}
        initialIsFollowing={!!userInfo.isFollowing}
        isMe={isMe}
        viewerId={viewerId}
        onRequireLogin={() =>
          router.push(`/login?callbackUrl=${encodeURIComponent(next)}`)
        }
        onFollowingChange={setIsFollowing} // FollowSection에서 토글되면 채널 내 상태도 동기화
      />

      {/* 라이브/녹화 섹션 — 팔로우 상태/역할 반영 */}
      <LiveNowHero
        stream={liveStream}
        role={role}
        onFollow={() => {
          const btn = document.getElementById("channel-follow-button");
          if (btn) {
            btn.scrollIntoView({ behavior: "smooth", block: "center" });
            // 포커스는 a11y/UX용
            (btn as HTMLElement).focus?.();

            // 원하면 “한 번 더” 사용자 행동 줄이기(자동 클릭)도 가능:
            // (btn as HTMLButtonElement).click?.();
            return;
          }

          // fallback
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      />

      <RecordingGrid
        recordings={recordingsMemo}
        role={role}
        isFollowing={isFollowing}
        // onFollow도 동일하게 선택적으로만 사용
      />
    </div>
  );
}
