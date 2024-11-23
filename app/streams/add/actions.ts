/**
 File Name : app/streams/add/actions
 Description : 라이브 스트리밍 시작 server 코드
 Author : 임도헌
 
 History
 Date        Author   Status    Description
 2024.11.12  임도헌   Created
 2024.11.12  임도헌   Modified  라이브 스트리밍 시작 server 코드 추가
 2024.11.19  임도헌   Modified  캐싱 기능 추가
 2024.11.21  임도헌   Modified  라이브 스트리밍 채팅방 생성 코드 추가
 */
"use server";

import db from "@/lib/db";
import getSession from "@/lib/session";
import { revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const title = z.string().min(5, "5자 이상 적어주세요.");

// 스트리밍 채팅방 생성
const createStreamChatRoom = async (streamId: number) => {
  await db.streamChatRoom.create({
    data: {
      live_stream: {
        connect: {
          id: streamId,
        },
      },
    },
    select: {
      id: true,
    },
  });
};

export const startStream = async (_: any, formData: FormData) => {
  const results = title.safeParse(formData.get("title"));
  if (!results.success) {
    return results.error.flatten();
  }
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${process.env.NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID}/stream/live_inputs`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_CLOUDFLARE_IMAGE_TOKEN}`,
      },
      body: JSON.stringify({
        meta: {
          name: results.data,
        },
        recording: {
          mode: "automatic",
        },
      }),
    }
  );
  const data = await response.json();
  const session = await getSession();
  const stream = await db.liveStream.create({
    data: {
      title: results.data,
      stream_id: data.result.uid,
      stream_key: data.result.rtmps.streamKey,
      userId: session.id!,
    },
    select: {
      id: true,
    },
  });
  // 라이브 스트리밍 채팅방 생성
  createStreamChatRoom(stream.id);

  revalidateTag("stream-list");
  redirect(`/streams/${stream.id}`);
};
