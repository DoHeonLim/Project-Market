/**
 File Name : app/(tabs)/live/page
 Description : 라이브 페이지
 Author : 임도헌
 
 History
 Date        Author   Status    Description
 2024.11.12  임도헌   Created
 2024.11.12  임도헌   Modified  라이브 페이지 추가
 2024.11.19  임도헌   Modified  캐싱 기능 추가
 */

import { PlusIcon } from "@heroicons/react/24/solid";
import Link from "next/link";
import { getLiveStreams } from "./actions";
import StreamList from "@/components/stream-list";
import { unstable_cache as nextCache } from "next/cache";

const getCachedLiveStreams = nextCache(getLiveStreams, ["stream-list"], {
  tags: ["stream-list"],
});

export default async function Live() {
  // const list = await listStream();
  const liveStreams = await getCachedLiveStreams();

  return (
    <div>
      <div className="mt-4">
        {liveStreams.length === 0 && (
          <div className="flex items-center justify-center w-full h-screen text-lg font-semibold">
            생성된 스트리밍이 없습니다.
          </div>
        )}
        {liveStreams.map((stream) => (
          <StreamList
            key={stream.id}
            id={stream.id}
            user={stream.user}
            title={stream.title}
            stream_id={stream.stream_id}
          />
        ))}
      </div>
      <Link
        href="/streams/add"
        className="fixed flex items-center justify-center text-white transition-colors bg-indigo-400 rounded-full size-16 bottom-24 right-8 hover:bg-indigo-500"
      >
        <PlusIcon className="size-10" />
      </Link>
    </div>
  );
}
