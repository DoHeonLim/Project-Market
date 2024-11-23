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
 */

import getSession from "@/lib/session";
import { notFound } from "next/navigation";
import { getStream, getStreamChatRoom, getStreamMessages } from "./actions";
import { streamStatus } from "@/app/(tabs)/live/actions";
import StreamDetail from "@/components/stream-detail";
import { unstable_cache as nextCache } from "next/cache";
import StreamChatRoom from "@/components/stream-chat-room";
import { getUserProfile } from "@/app/chats/[id]/actions";

// 스트리밍 캐싱
const getCachedStream = nextCache(getStream, ["stream-detail"], {
  tags: ["stream-detail"],
});

// 스트리밍 상태 캐싱
const getCachedStatus = nextCache(streamStatus, ["stream-detail-status"], {
  tags: ["stream-detail-status"],
  revalidate: 60, // 1분
});

export default async function StreamDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const id = Number(params.id);
  if (isNaN(id)) {
    return notFound();
  }

  const [stream, session, streamChatRoom, user] = await Promise.all([
    getCachedStream(id),
    getSession(),
    getStreamChatRoom(id),
    getUserProfile(),
  ]);

  if (!stream || !streamChatRoom || !user) {
    return notFound();
  }

  // 현재 방송 상태
  const status = await getCachedStatus(stream.stream_id);
  // 방송 상태 가져오기 실패 시 스트리밍이 존재하지 않음
  if (!status.success) {
    return notFound();
  }

  // 방송 메시지 초기화
  const initialStreamMessage = await getStreamMessages(streamChatRoom.id);
  console.log(initialStreamMessage);

  return (
    <div className="p-10">
      <StreamDetail
        stream={stream}
        me={session.id!}
        status={status}
        streamId={id}
      />
      <StreamChatRoom
        initialStreamMessage={initialStreamMessage}
        streamChatRoomId={streamChatRoom.id}
        streamChatRoomhost={streamChatRoom.live_stream.userId}
        userId={session.id!}
        username={user.username}
        avatar={user.avatar!}
      />
    </div>
  );
}
