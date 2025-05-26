/**
 File Name : app/streams/[id]/page
 Description : 라이브 스트리밍 개별 페이지
 Author : 임도헌
 
 History
 Date        Author   Status    Description
 2024.11.12  임도헌   Created
 2024.11.12  임도헌   Modified  라이브 스트리밍 개별 페이지 추가
 2024.11.19  임도헌   Modified  캐싱 기능 추가
 2024.11.21  임도헌   Modified  Link를 StreamDetail로 옮김
 2024.11.23  임도헌   Modified  스트리밍 채팅방 컴포넌트 추가
 2024.12.12  임도헌   Modified  뒤로가기 버튼 추가
 2025.05.16  임도헌   Modified  스트리밍 상태 캐싱 최적화
 */

import getSession from "@/lib/session";
import { notFound } from "next/navigation";
import {
  getStreamDetail,
  getStreamChatRoom,
  getStreamMessages,
  updateStreamStatus,
} from "./actions";
import { unstable_cache as nextCache } from "next/cache";
import StreamChatRoom from "@/components/live/StreamChatRoom";
import { getUserProfile } from "@/app/chats/[id]/actions";
import BackButton from "@/components/common/BackButton";
import StreamDetail from "@/components/live/StreamDetail";

// 스트리밍 캐싱
const getCachedStream = nextCache(getStreamDetail, ["stream-detail"], {
  tags: ["stream-detail"],
});

// 스트리밍 상태 캐싱
const getCachedStatus = nextCache(
  updateStreamStatus,
  ["stream-detail-status"],
  {
    tags: ["stream-detail-status"],
    // revalidate: 30, // 30초마다 갱신
  }
);

export default async function StreamDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const id = Number(params.id);
  if (isNaN(id)) {
    return notFound();
  }

  const [initialStream, session, streamChatRoom, user] = await Promise.all([
    getCachedStream(id),
    getSession(),
    getStreamChatRoom(id),
    getUserProfile(),
  ]);

  if (!initialStream || !streamChatRoom || !user) {
    return notFound();
  }

  // 현재 방송 상태 업데이트 (캐시 적용)
  const status = await getCachedStatus(initialStream.stream_id);
  if (!status.success) {
    console.error("Failed to update stream status:", status.error);
    // 상태 업데이트 실패 시에도 페이지는 표시
  }

  // 상태가 변경되었다면 stream 데이터 갱신
  let stream = initialStream;
  if (status.success && status.status !== initialStream.status) {
    const updatedStream = await getCachedStream(id);
    if (updatedStream) {
      stream = updatedStream;
    }
  }

  // 방송 메시지 초기화
  const initialStreamMessage = await getStreamMessages(streamChatRoom.id);

  return (
    <div>
      <BackButton className="" />
      <div className="p-10">
        <StreamDetail stream={stream} me={session.id!} streamId={id} />
        <StreamChatRoom
          initialStreamMessage={initialStreamMessage}
          streamChatRoomId={streamChatRoom.id}
          streamChatRoomhost={streamChatRoom.live_stream.userId}
          userId={session.id!}
          username={user.username}
          avatar={user.avatar!}
        />
      </div>
    </div>
  );
}
