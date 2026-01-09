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
 * 2025.11.15  임도헌   Modified   layout으로 back버튼 이동
 * 2025.12.09  임도헌   Modified   403 리다이렉트 파라미터 정리
 * 2026.01.02  임도헌   Modified   상세 캐시 wrapper를 base + 태그 주입 방식으로 정리
 * 2026.01.03  임도헌   Modified   getSession() 후 유저 조회를 getUserInfo() → getUserInfoById(session.id)로 변경(중복 세션 조회 제거)s
 */

export const dynamic = "force-dynamic";

import { unstable_cache as nextCache } from "next/cache";
import * as T from "@/lib/cache/tags";
import { notFound, redirect } from "next/navigation";

import getSession from "@/lib/session";
import { getUserInfoById } from "@/lib/user/getUserInfo";
import {
  getBroadcastDetail,
  StreamDetailDTO,
} from "@/lib/stream/getBroadcastDetail";
import { getStreamChatRoom } from "@/lib/chat/room/getStreamChatRoom";
import { isBroadcastUnlockedFromSession } from "@/lib/stream/privateUnlockSession";
import { checkBroadcastAccess } from "@/lib/stream/checkBroadcastAccess";
import { getInitialStreamMessages } from "@/lib/chat/messages/getInitialStreamMessages";
import type { StreamVisibility } from "@/types/stream";
import StreamDetail from "@/components/stream/StreamDetail";
import StreamChatRoom from "@/components/stream/StreamChatRoom";
import StreamTopbar from "@/components/stream/StreamTopBar";
import StreamMobileChatSection from "@/components/stream/StreamMobileChatSection";

/** base: tags 없는 캐시 함수 */
const _getCachedBroadcastBase = nextCache(
  getBroadcastDetail,
  ["broadcast-detail-by-id"],
  {
    tags: [],
  }
);

export default async function StreamDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const broadcastId = Number(params.id);
  if (!Number.isFinite(broadcastId) || broadcastId <= 0) notFound();

  // 상세 캐시 (태그로 무효화)
  const getCachedBroadcast = nextCache(
    () => _getCachedBroadcastBase(broadcastId),
    ["broadcast-detail-by-id"],
    { tags: [T.BROADCAST_DETAIL(broadcastId)] }
  );

  const [session, fetched] = await Promise.all([
    getSession(),
    getCachedBroadcast(),
  ]);

  if (!session?.id) {
    redirect(
      `/login?callbackUrl=${encodeURIComponent(`/streams/${broadcastId}`)}`
    );
  }
  if (!fetched) notFound();

  const initialBroadcast = fetched as StreamDetailDTO;

  const ownerId = initialBroadcast.userId ?? null;
  if (!ownerId) notFound();

  const isOwner = !!session?.id && session.id === ownerId;

  if (!isOwner) {
    const isUnlocked = isBroadcastUnlockedFromSession(session, broadcastId);

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
      const callbackUrl = `/streams/${broadcastId}`;

      redirect(
        `/403?reason=${guard.reason}` +
          `&username=${encodeURIComponent(ownerUsername)}` +
          `&callbackUrl=${encodeURIComponent(callbackUrl)}` +
          `&sid=${broadcastId}` +
          `&uid=${ownerId}`
      );
    }
  }

  const [streamChatRoom, user] = await Promise.all([
    getStreamChatRoom(broadcastId),
    getUserInfoById(session.id!),
  ]);
  if (!streamChatRoom || !user) notFound();

  const initialStreamMessage = await getInitialStreamMessages(
    streamChatRoom.id
  );

  return (
    <main className="w-full">
      <StreamTopbar
        visibility={initialBroadcast.visibility}
        backFallbackHref="/streams"
      />
      <div className="xl:grid xl:grid-cols-[1fr,min(100%,900px),400px] ">
        <div className="hidden xl:block" />

        <div className="mx-auto w-full">
          <StreamDetail
            stream={initialBroadcast}
            me={session?.id ?? null}
            streamId={broadcastId}
          />
        </div>

        <div
          className="hidden xl:block xl:ml-2 h-[calc(100vh-96px)] max-w-[50vh]"
          aria-label="stream chat panel"
        >
          <StreamChatRoom
            initialStreamMessage={initialStreamMessage}
            streamChatRoomId={streamChatRoom.id}
            streamChatRoomhost={streamChatRoom.broadcast.liveInput.userId}
            userId={session.id!}
            username={user.username}
          />
        </div>
      </div>

      <div className="xl:hidden mt-1">
        <StreamMobileChatSection
          initialStreamMessage={initialStreamMessage}
          streamChatRoomId={streamChatRoom.id}
          streamChatRoomhost={streamChatRoom.broadcast.liveInput.userId}
          userId={session.id!}
          username={user.username}
        />
      </div>
    </main>
  );
}
