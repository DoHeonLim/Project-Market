/**
 File Name : app/streams/[id]/actions
 Description : 라이브 스트리밍 server 코드
 Author : 임도헌
 
 History
 Date        Author   Status    Description
 2024.11.12  임도헌   Created
 2024.11.12  임도헌   Modified  현재 스트리밍 얻어오는 코드 추가
 2024.11.18  임도헌   Modified  스트리밍이 끝났다면 삭제하는 코드 추가
 2024.11.19  임도헌   Modified  캐싱 기능 추가
 2024.11.21  임도헌   Modified  console.log 삭제
 2024.11.22  임도헌   Modified  스트리밍 채팅방 관련 코드 추가
 */
"use server";

import { DeleteResponse } from "@/components/comment-delete-button";
import db from "@/lib/db";
import getSession from "@/lib/session";
import { Prisma } from "@prisma/client";
import { revalidateTag } from "next/cache";

export type InitialStreamChatMessages = Prisma.PromiseReturnType<
  typeof getStreamMessages
>;

// 현재 스트리밍 얻어오기
export const getStream = async (id: number) => {
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

// 현재 스트리밍 삭제
export const deleteStream = async (
  streamId: string,
  id: number
): Promise<DeleteResponse> => {
  try {
    // prisma DB 삭제
    await db.liveStream.delete({
      where: {
        id,
      },
    });
    await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${process.env.NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID}/stream/live_inputs/${streamId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_CLOUDFLARE_IMAGE_TOKEN}`,
        },
      }
    );
    revalidateTag("stream-list");
    return { success: true };
  } catch (e) {
    console.error(e);
    return { success: false, error: "스트리밍 삭제 중 오류가 발생했습니다." };
  }
};

// 라이브 스트리밍 녹화 및 재생
export const recodingStream = async (streamId: string) => {
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${process.env.NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID}/stream/live_inputs/${streamId}/videos`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_CLOUDFLARE_IMAGE_TOKEN}`,
      },
    }
  );
  const result = await response.json();

  const recoding = result.result;
  return recoding;
};

// 라이브 스트리밍의 스트리밍 채팅방 찾기
export const getStreamChatRoom = async (liveStreamId: number) => {
  const streamChatRoom = await db.streamChatRoom.findUnique({
    where: {
      liveStreamId,
    },
    select: {
      id: true,
      live_stream: {
        select: {
          userId: true,
        },
      },
    },
  });
  return streamChatRoom;
};

// 스트리밍 채팅방의 모든 메시지를 가져오는 함수
export const getStreamMessages = async (streamChatRoomId: number) => {
  const streammMessages = await db.streamMessage.findMany({
    where: {
      streamChatRoomId,
    },
    select: {
      id: true,
      payload: true,
      created_at: true,
      userId: true,
      user: {
        select: {
          avatar: true,
          username: true,
        },
      },
    },
  });
  return streammMessages;
};

// 스트리밍 메시지 저장
export const saveStreamMessage = async (
  payload: string,
  streamChatRoomId: number
) => {
  const session = await getSession();
  await db.streamMessage.create({
    data: {
      payload,
      streamChatRoomId,
      userId: session.id!,
    },
    select: { id: true },
  });
};
