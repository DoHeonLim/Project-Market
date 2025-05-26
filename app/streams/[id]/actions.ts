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
 2025.05.01  임도헌   Modified  .tsx -> .ts로 수정
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

  // 썸네일이 있는 경우 DB 업데이트
  if (recoding && recoding.length > 0 && recoding[0].thumbnail) {
    const stream = await db.liveStream.findFirst({
      where: {
        stream_id: streamId,
      },
    });

    if (stream) {
      await db.liveStream.update({
        where: {
          id: stream.id,
        },
        data: {
          thumbnail: recoding[0].thumbnail,
        },
      });
      revalidateTag("stream-detail");
    }
  }

  return recoding;
};

// 라이브 스트리밍의 스트리밍 채팅방 찾기
export const getStreamChatRoom = async (liveStreamId: number) => {
  return await db.streamChatRoom.findUnique({
    where: { liveStreamId },
    select: {
      id: true,
      live_stream: {
        select: {
          userId: true,
        },
      },
    },
  });
};

// 스트리밍 채팅방의 모든 메시지를 가져오는 함수
export const getStreamMessages = async (streamChatRoomId: number) => {
  return await db.streamMessage.findMany({
    where: { streamChatRoomId },
    orderBy: { created_at: "asc" },
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

// 방송 상세 정보
export const getStreamDetail = async (id: number) => {
  return await db.liveStream.findUnique({
    where: { id },
    include: {
      user: {
        select: { id: true, username: true, avatar: true, created_at: true },
      },
      category: {
        select: { id: true, eng_name: true, kor_name: true, icon: true },
      },
      tags: true,
    },
  });
};

// 스트리밍 상태 업데이트
export const updateStreamStatus = async (streamId: string) => {
  try {
    // Cloudflare API에서 현재 상태 가져오기
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${process.env.NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID}/stream/live_inputs/${streamId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_CLOUDFLARE_IMAGE_TOKEN}`,
        },
      }
    );
    const status = await response.json();
    if (!status.result.status)
      return {
        success: false,
        error: "Failed to update stream status",
      };
    console.log("클라우드플레어 status.result.status:", status.result.status);

    if (!status.success) {
      throw new Error("Failed to get stream status");
    }

    // DB에서 해당 스트림 찾기
    const stream = await db.liveStream.findFirst({
      where: {
        stream_id: streamId,
      },
    });

    if (!stream) {
      throw new Error("Stream not found");
    }

    // 상태 업데이트
    const currentState = status.result.status?.current?.state || "disconnected";

    // 상태에 따른 StreamStatus 값 매핑
    let streamStatus;
    if (currentState === "connected") {
      streamStatus = "CONNECTED";
    } else if (currentState === "disconnected" && stream.started_at) {
      // 방송이 시작되었다가 종료된 경우
      streamStatus = "ENDED";
    } else {
      streamStatus = "DISCONNECTED";
    }

    const startedAt =
      streamStatus === "CONNECTED" && !stream.started_at
        ? new Date()
        : stream.started_at;
    const endedAt =
      streamStatus === "ENDED" && stream.started_at
        ? new Date()
        : stream.ended_at;

    // DB 업데이트
    await db.liveStream.update({
      where: {
        id: stream.id,
      },
      data: {
        status: streamStatus,
        last_status_check: new Date(),
        replay_view_count: 0,
        started_at: startedAt,
        ended_at: endedAt,
        duration:
          startedAt && endedAt
            ? Math.floor((endedAt.getTime() - startedAt.getTime()) / 1000)
            : null,
      },
    });

    // stream 데이터 캐시 갱신
    revalidateTag("stream-detail");

    return {
      success: true,
      status: streamStatus,
    };
  } catch (error) {
    console.error("Failed to update stream status:", error);
    return {
      success: false,
      error: "Failed to update stream status",
    };
  }
};
