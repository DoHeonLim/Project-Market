/**
 * File Name : app/streams/[id]/page
 * Description : 라이브 스트리밍 개별 페이지 (Broadcast 스키마 기준)
 * Author : 임도헌
 *
 * History
 * Date        Author   Status     Description
 * 2024.11.12  임도헌   Created
 * 2024.11.12  임도헌   Modified   라이브 스트리밍 개별 페이지 추가
 * 2024.11.19  임도헌   Modified   캐싱 기능 추가
 * 2024.11.21  임도헌   Modified   Link를 StreamDetail로 옮김
 * 2024.11.23  임도헌   Modified   스트리밍 채팅방 컴포넌트 추가
 * 2024.12.12  임도헌   Modified   뒤로가기 버튼 추가
 * 2025.05.16  임도헌   Modified   스트리밍 상태 캐싱 최적화
 * 2025.08.14  임도헌   Modified   PRIVATE 비번 해제 상태(isPrivateUnlocked) 반영
 * 2025.08.23  임도헌   Modified   getSession/스트림 조회 병렬화, avatar 널 가드 보강
 * 2025.09.05  임도헌   Modified   dynamic="force-dynamic" 적용 — PRIVATE 언락/팔로우 직후 가드 최신화
 * 2025.09.09  임도헌   Modified   가드/채팅 로직 단순화
 * 2025.09.16  임도헌   Modified   Broadcast 스키마 반영, 캐시 태그 교체(broadcast-detail-*), 채팅방 조회/host 경로 수정
 * 2025.09.16  임도헌   Modified   네이밍 정리(checkBroadcastAccess/isBroadcastUnlocked), 캐시 태그 상수화
 * 2025.09.30  임도헌   Modified   데스크톱, 모바일 UI 변경
 */
export const dynamic = "force-dynamic";

import { unstable_cache as nextCache } from "next/cache";
import { notFound, redirect } from "next/navigation";

import getSession from "@/lib/session";
import { getUserInfo } from "@/lib/user/getUserInfo";
import {
  getBroadcastDetail,
  StreamDetailDTO,
} from "@/lib/stream/getBroadcastDetail";
import { getStreamChatRoom } from "@/lib/chat/room/getStreamChatRoom";
import { isBroadcastUnlocked } from "@/lib/stream/unlockPrivateBroadcast";
import { checkBroadcastAccess } from "@/lib/stream/checkBroadcastAccess";
import { getInitialStreamMessages } from "@/lib/chat/messages/getInitialStreamMessages";
import type { StreamVisibility } from "@/types/stream";
import BackButton from "@/components/common/BackButton";
import StreamDetail from "@/components/stream/StreamDetail";
import StreamChatRoom from "@/components/stream/StreamChatRoom";

export default async function StreamDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const broadcastId = Number(params.id);
  if (!Number.isFinite(broadcastId) || broadcastId <= 0) notFound();

  // 캐시 태그 상수화
  const CACHE_TAG = `broadcast-detail-${broadcastId}` as const;

  // 상세 캐시 (태그로 무효화)
  const getCachedBroadcast = nextCache(getBroadcastDetail, [CACHE_TAG], {
    tags: [CACHE_TAG],
  });

  // 로그인 전제(미들웨어)라도 널 가드 유지
  const [session, fetched] = await Promise.all([
    getSession(),
    getCachedBroadcast(broadcastId),
  ]);

  if (!fetched) notFound();

  const initialBroadcast = fetched as StreamDetailDTO;

  const ownerId = initialBroadcast.userId ?? null;
  if (!ownerId) notFound();

  const isOwner = !!session?.id && session.id === ownerId;

  if (!isOwner) {
    // 접근 가드 (비공개/팔로워 전용/언락 반영)
    const isUnlocked = await isBroadcastUnlocked(broadcastId);

    // visibility를 StreamVisibility로 명시
    const guard = await checkBroadcastAccess(
      {
        userId: initialBroadcast.userId,
        visibility: initialBroadcast.visibility as StreamVisibility,
      },
      session?.id ?? null,
      { isPrivateUnlocked: isUnlocked }
    );

    if (!guard.allowed) {
      const ownerUsername = initialBroadcast.user.username;
      const next = encodeURIComponent(`/streams/${broadcastId}`);
      // 403 핸들러로 위임 (사유/다음경로 전달)
      redirect(
        `/403?reason=${guard.reason}&username=${encodeURIComponent(
          ownerUsername
        )}&next=${next}&sid=${broadcastId}`
      );
    }
  }

  // 채팅방/유저 정보 로드 (로그인 전제)
  const [streamChatRoom, user] = await Promise.all([
    getStreamChatRoom(broadcastId),
    getUserInfo(),
  ]);
  if (!streamChatRoom || !user) notFound();

  const initialStreamMessage = await getInitialStreamMessages(
    streamChatRoom.id
  );

  return (
    <main className="w-full">
      <div className="py-6 px-4 md:px-6">
        <BackButton href="/streams" />

        {/* 데스크탑: 중앙 컬럼 + 오른쪽 고정 채팅(360px)
            모바일: 오른쪽 채팅은 숨기고 아래에 렌더 */}
        <div className="xl:grid xl:grid-cols-[1fr,min(100%,900px),400px] ">
          {/* 왼쪽 gutter (빈 칸) */}
          <div className="hidden xl:block" />

          {/* 중앙: 비디오 + 메타 (max width 고정) */}
          <div className="mx-auto w-full max-w-[900px]">
            <StreamDetail
              stream={initialBroadcast}
              me={session?.id ?? null}
              streamId={broadcastId}
            />
          </div>

          {/* 오른쪽: 데스크탑 전용 고정 채팅 패널 */}
          <aside
            className="hidden xl:block xl:ml-8"
            aria-label="stream chat panel"
          >
            <div style={{ height: "calc(100vh - 96px)" }}>
              <StreamChatRoom
                initialStreamMessage={initialStreamMessage}
                streamChatRoomId={streamChatRoom.id}
                streamChatRoomhost={streamChatRoom.broadcast.liveInput.userId}
                userId={session.id!}
                username={user.username}
              />
            </div>
          </aside>
        </div>

        {/* 모바일: 중앙 콘텐츠 아래에 채팅 렌더 (full width) */}
        <div className="xl:hidden mt-6">
          <StreamChatRoom
            initialStreamMessage={initialStreamMessage}
            streamChatRoomId={streamChatRoom.id}
            streamChatRoomhost={streamChatRoom.broadcast.liveInput.userId}
            userId={session.id!}
            username={user.username}
          />
        </div>
      </div>
    </main>
  );
}
