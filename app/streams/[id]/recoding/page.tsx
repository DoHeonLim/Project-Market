/**
 File Name : app/streams/[id]/recoding
 Description : 라이브 스트리밍 녹화본 페이지
 Author : 임도헌
 
 History
 Date        Author   Status    Description
 2024.11.19  임도헌   Created
 2024.11.19  임도헌   Modified  라이브 스트리밍 녹화본 페이지 추가
 2024.11.21  임도헌   Modified  console.log 삭제
 2024.12.07  임도헌   Modified  프로필 이미지 컴포넌트 분리
 2024.12.12  임도헌   Modified  녹화본 생성 시간 표시 변경
 */

import { notFound } from "next/navigation";
import { getStream, recodingStream } from "../actions";
import { unstable_cache as nextCache } from "next/cache";
import UserAvatar from "@/components/common/UserAvatar";
import TimeAgo from "@/components/common/TimeAgo";

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
  return (
    <div className="flex flex-col items-center justify-center mt-4 gap-6">
      <div className="text-4xl font-semibold">녹화본</div>
      <div className="flex flex-col gap-4 h-[90vh] overflow-y-auto scrollbar">
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
              <UserAvatar
                avatar={stream.user.avatar}
                username={stream.user.username}
                size="md"
              />
            </div>
            <div>{record.meta.name}</div>
            <TimeAgo date={record.created.toString()} />
          </div>
        ))}
      </div>
    </div>
  );
}
