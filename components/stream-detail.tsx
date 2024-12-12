/**
File Name : components/stream-detail
Description : 스트리밍 상세 컴포넌트
Author : 임도헌

History
Date        Author   Status    Description
2024.11.19  임도헌   Created
2024.11.19  임도헌   Modified  스트리밍 상세 컴포넌트 추가
2024.11.21  임도헌   Modified  Link를 streams/[id]/page에서 StreamDetail로 옮김
2024.11.21  임도헌   Modified  스트리밍 하기 위한 정보들 본인만 보이게 변경
2024.12.07  임도헌   Modified  프로필 이미지 컴포넌트 분리
*/
"use client";

import LiveStatusButton from "./live-status-button";
import StreamDeleteButton from "./stream-delete-button";
import { deleteStream } from "@/app/streams/[id]/actions";
import Link from "next/link";
import UserAvatar from "./user-avatar";

interface IStreamDetail {
  stream: {
    title: string;
    stream_key: string;
    stream_id: string;
    userId: number;
    user: {
      username: string;
      avatar: string | null;
    };
  };
  status: any;
  me: number;
  streamId: number;
}

export default function StreamDetail({
  stream,
  status,
  me,
  streamId,
}: IStreamDetail) {
  return (
    <>
      <LiveStatusButton status={status} />
      <div className="relative aspect-video">
        <iframe
          src={`${process.env.NEXT_PUBLIC_CLOUDFLARE_STREAM_DOMAIN}/${stream.stream_id}/iframe`}
          className="w-full h-full rounded-xl"
          allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
          allowFullScreen={true}
        ></iframe>
      </div>
      <div className="flex items-center gap-3 border-2 p-4 my-2 border-neutral-700 rounded-xl">
        <UserAvatar
          avatar={stream.user.avatar}
          username={stream.user.username}
          size="md"
        />
        <div>
          <h1 className="text-2xl font-semibold ml-4">{stream.title}</h1>
        </div>
      </div>
      {stream.userId === me ? (
        <div className="p-5 text-black bg-yellow-200 rounded-md scroll-auto">
          <span className="text-base font-semibold">
            {`스트리밍 소프트웨어를 사용하세요. ex) OBS Studio`}
          </span>
          <div className="flex gap-2">
            <span className="font-semibold">스트리밍 URL:</span>
            <span>rtmps://live.cloudflare.com:443/live/</span>
          </div>
          <div className="flex flex-wrap">
            <span className="font-semibold">Secret Key:</span>
            <span className="text-xs">{stream.stream_key}</span>
          </div>
        </div>
      ) : null}
      {stream.userId !== me ? null : (
        <StreamDeleteButton
          streamId={stream.stream_id}
          id={streamId}
          isLived={status.result.status?.current.state}
          onDelete={deleteStream}
        />
      )}
      <Link
        href={`/streams/${streamId}/recoding`}
        className="flex items-center justify-center flex-1 font-semibold text-white transition-colors my-4 bg-indigo-500 rounded-md h-8 px-auto hover:bg-indigo-600 sm:text-lg md:text-xl"
      >
        녹화본 보기
      </Link>
    </>
  );
}
