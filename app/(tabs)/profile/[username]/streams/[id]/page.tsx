/**
 File Name : app/(tabs)/profile/[username]/streams/[id]/page
 Description : 유저의 특정 녹화본 페이지
 Author : 임도헌
 
 History
 Date        Author   Status    Description
 2025.05.16  임도헌   Created
 */

import { notFound } from "next/navigation";
import { getStream, recodingStream } from "@/app/streams/[id]/actions";
import { unstable_cache as nextCache } from "next/cache";
import TimeAgo from "@/components/common/TimeAgo";
import BackButton from "@/components/common/BackButton";

// 스트리밍 캐싱
const getCachedStream = nextCache(getStream, ["stream-detail"], {
  tags: ["stream-detail"],
});

export default async function RecordingPage({
  params,
}: {
  params: { username: string; id: string };
}) {
  const id = Number(params.id);
  if (isNaN(id)) {
    return notFound();
  }

  const stream = await getCachedStream(id);
  if (!stream) {
    return notFound();
  }

  const recordings = await recodingStream(stream.stream_id);
  if (!recordings || recordings.length === 0) {
    return notFound();
  }

  // 가장 최근 녹화본 사용
  const recording = recordings[0];

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <BackButton className="mb-4" />

      {/* 스트리밍 정보 헤더 */}
      <div className="flex items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold dark:text-white">{stream.title}</h1>
          <p className="text-gray-500 dark:text-gray-400">
            {stream.user.username}의 방송 녹화본
          </p>
        </div>
      </div>

      {/* 녹화본 플레이어 */}
      <div className="aspect-video rounded-xl overflow-hidden mb-6">
        <iframe
          src={`${process.env.NEXT_PUBLIC_CLOUDFLARE_STREAM_DOMAIN}/${recording.uid}/iframe`}
          className="w-full h-full"
          allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
          allowFullScreen={true}
        />
      </div>

      {/* 녹화본 정보 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4 dark:text-white">
          {recording.meta.name}
        </h2>
        <div className="flex items-center gap-4 text-gray-500 dark:text-gray-400">
          <TimeAgo date={recording.created.toString()} />
          <span>•</span>
          <span>
            {Math.floor(recording.duration / 60)}분{" "}
            {Math.floor(recording.duration % 60)}초
          </span>
        </div>
      </div>
    </div>
  );
}
