/**
 File Name : app/streams/[id]/page
 Description : 라이브 스트리밍 개별 페이지
 Author : 임도헌
 
 History
 Date        Author   Status    Description
 2024.11.12  임도헌   Created
 2024.11.12  임도헌   Modified  라이브 스트리밍 개별 페이지 추가
 */

import db from "@/lib/db";
import getSession from "@/lib/session";
import { UserIcon } from "@heroicons/react/24/solid";
import Image from "next/image";
import { notFound } from "next/navigation";

const getStream = async (id: number) => {
  const stream = await db.liveStream.findUnique({
    where: {
      id,
    },
    select: {
      title: true,
      stream_key: true,
      stream_id: true,
      userId: true,
      user: {
        select: {
          avatar: true,
          username: true,
        },
      },
    },
  });
  return stream;
};

export default async function StreamDetail({
  params,
}: {
  params: { id: string };
}) {
  const id = Number(params.id);
  if (isNaN(id)) {
    return notFound();
  }
  const stream = await getStream(id);
  if (!stream) {
    return notFound();
  }
  const session = await getSession();
  console.log(stream);
  return (
    <div className="p-10">
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
        <div className="flex gap-2">
          <span className="font-semibold">스트리밍 URL:</span>
          <span>rtmps://live.cloudflare.com:443/live/</span>
        </div>
        {stream.userId === session.id! ? (
          <div className="flex flex-wrap">
            <span className="font-semibold">Secret Key:</span>
            <span>{stream.stream_key}</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}
