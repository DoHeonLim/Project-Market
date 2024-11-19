/**
File Name : components/stream-detail
Description : 스트리밍 상세 컴포넌트
Author : 임도헌

History
Date        Author   Status    Description
2024.11.19  임도헌   Created
2024.11.19  임도헌   Modified  스트리밍 상세 컴포넌트 추가

*/
"use client";

import Image from "next/image";
import LiveStatusButton from "./live-status-button";
import { UserIcon } from "@heroicons/react/24/solid";
import StreamDeleteButton from "./stream-delete-button";
import { deleteStream } from "@/app/streams/[id]/actions";

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
          className="w-full h-full rounded-md"
          allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
          allowFullScreen={true}
        ></iframe>
      </div>
      <div className="flex items-center gap-3 p-5 border-b border-neutral-700">
        <div className="overflow-hidden rounded-full size-10">
          {stream.user.avatar !== null ? (
            <Image
              src={stream.user.avatar!}
              width={40}
              height={40}
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
      <div className="p-5">
        <h1 className="text-2xl font-semibold">{stream.title}</h1>
      </div>
      <div className="p-5 text-black bg-yellow-200 rounded-md scroll-auto">
        <span className="text-base font-semibold">
          {`스트리밍 소프트웨어를 사용하세요. ex) OBS Studio`}
        </span>
        <div className="flex gap-2">
          <span className="font-semibold">스트리밍 URL:</span>
          <span>rtmps://live.cloudflare.com:443/live/</span>
        </div>
        {stream.userId === me ? (
          <div className="flex flex-wrap">
            <span className="font-semibold">Secret Key:</span>
            <span className="text-xs">{stream.stream_key}</span>
          </div>
        ) : null}
      </div>
      {stream.userId !== me ? null : (
        <StreamDeleteButton
          streamId={stream.stream_id}
          id={streamId}
          isLived={status.result.status?.current.state}
          onDelete={deleteStream}
        />
      )}
    </>
  );
}
