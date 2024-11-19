/**
 File Name : app/streams/[id]/recoding
 Description : 라이브 스트리밍 녹화본 페이지
 Author : 임도헌
 
 History
 Date        Author   Status    Description
 2024.11.19  임도헌   Created
 2024.11.19  임도헌   Modified  라이브 스트리밍 녹화본 페이지 추가
 */

import { notFound } from "next/navigation";
import { getStream, recodingStream } from "../actions";
import { unstable_cache as nextCache } from "next/cache";
import Image from "next/image";
import { UserIcon } from "@heroicons/react/24/solid";
import { formatToTimeAgo } from "@/lib/utils";

interface IRecodingProps {
  meta: { name: string };
  thumbnail: string;
  uid: string;
  created: Date;
  preview: string;
  duration: number;
}

// 스트리밍 캐싱
const getCachedStream = nextCache(getStream, ["stream-detail"], {
  tags: ["stream-detail"],
});

export default async function RecordingPage({
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

  const recodingVideo = await recodingStream(stream.stream_id);
  console.log(recodingVideo);
  return (
    <div className="flex flex-col items-center justify-center gap-6 mt-4">
      <div className="text-4xl font-semibold">녹화본</div>
      {recodingVideo.map((record: IRecodingProps) => (
        <div
          key={record.uid}
          className="flex flex-col justify-center items-center gap-4 px-4 py-4 transition-colors border-2 border-neutral-500 rounded-2xl hover:ring-4 hover:ring-neutral-500 hover:border-neutral-400 *:text-white"
        >
          <iframe
            src={`${process.env.NEXT_PUBLIC_CLOUDFLARE_STREAM_DOMAIN}/${record.uid}/iframe`}
            className="w-[200px] h-[200px] md:size-[300px] lg:size-[500px] rounded-md"
            allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
            allowFullScreen={true}
          ></iframe>
          <div className="flex items-center gap-3">
            <div className="overflow-hidden rounded-full size-10">
              {stream.user.avatar !== null ? (
                <Image
                  width={40}
                  height={40}
                  src={stream.user.avatar!}
                  alt={stream.user.username}
                />
              ) : (
                <UserIcon />
              )}
            </div>
            <div>
              <h3>{stream.user.username}</h3>
            </div>
          </div>
          <div>{record.meta.name}</div>
          <div>{formatToTimeAgo(record.created.toString())}</div>
        </div>
      ))}
    </div>
  );
}
