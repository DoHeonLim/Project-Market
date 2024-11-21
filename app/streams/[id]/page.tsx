/**
 File Name : app/streams/[id]/page
 Description : 라이브 스트리밍 개별 페이지
 Author : 임도헌
 
 History
 Date        Author   Status    Description
 2024.11.12  임도헌   Created
 2024.11.12  임도헌   Modified  라이브 스트리밍 개별 페이지 추가
 2024.11.19  임도헌   Modified  캐싱 기능 추가
 */

import getSession from "@/lib/session";
import { notFound } from "next/navigation";
import { getStream } from "./actions";
import { streamStatus } from "@/app/(tabs)/live/actions";
import StreamDetail from "@/components/stream-detail";
import Link from "next/link";
import { unstable_cache as nextCache } from "next/cache";

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
  const stream = await getCachedStream(id);
  if (!stream) {
    return notFound();
  }

  const session = await getSession();

  // 현재 방송 상태
  const status = await getCachedStatus(stream.stream_id);
  // 방송 상태 가져오기 실패 시 스트리밍이 존재하지 않음
  if (!status.success) {
    return notFound();
  }

  return (
    <div className="p-10">
      <StreamDetail
        stream={stream}
        me={session.id!}
        status={status}
        streamId={id}
      />
      <Link
        href={`/streams/${id}/recoding`}
        className="flex items-center justify-center flex-1 mt-4 font-semibold text-white transition-colors bg-indigo-400 rounded-md h-7 px-auto hover:bg-indigo-500 sm:text-lg md:text-xl"
      >
        녹화본 보기
      </Link>
    </div>
  );
}
