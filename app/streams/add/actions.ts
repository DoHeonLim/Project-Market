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
 2025.05.22  임도헌   Modified  스트리밍 상태 관리 시스템 반영
 */
"use server";

import getSession from "@/lib/session";
import db from "@/lib/db";
import { z } from "zod";
import { revalidateTag } from "next/cache";
import { STREAM_VISIBILITY } from "@/lib/constants";

// 스트리밍 접근 제어 상수

// type StreamVisibility =
//   (typeof STREAM_VISIBILITY)[keyof typeof STREAM_VISIBILITY];

// 스트리밍 생성 스키마
const streamSchema = z
  .object({
    title: z.string().min(5, "5자 이상 적어주세요."),
    description: z.string().optional(),
    thumbnail: z.string().optional(),
    visibility: z
      .enum([
        STREAM_VISIBILITY.PUBLIC,
        STREAM_VISIBILITY.PRIVATE,
        STREAM_VISIBILITY.FOLLOWERS,
      ])
      .default(STREAM_VISIBILITY.PUBLIC),
    password: z.string().optional(),
    streamCategoryId: z.number().min(1, "카테고리를 선택해주세요."),
    tags: z.array(z.string()).optional(),
  })
  .refine(
    (data) => {
      if (data.visibility === STREAM_VISIBILITY.PRIVATE && !data.password) {
        return false;
      }
      return true;
    },
    {
      message: "비밀번호를 입력해주세요.",
      path: ["password"],
    }
  );

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

type StreamResult = {
  success: boolean;
  streamId?: number;
  error?: string;
  streamKey?: string;
  rtmpUrl?: string;
};

// 스트리밍 상태 상수 정의
const STREAM_STATUS = {
  CREATED: "CREATED", // 생성됨 (방송 시작 전)
  CONNECTED: "CONNECTED", // 연결됨 (방송 중)
  DISCONNECTED: "DISCONNECTED", // 연결 해제됨
  FAILED: "FAILED", // 실패
} as const;

export const startStream = async (
  _: any,
  formData: FormData
): Promise<StreamResult> => {
  // 폼 데이터 파싱
  const results = streamSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    thumbnail: formData.get("thumbnail"),
    visibility: formData.get("visibility"),
    password: formData.get("password"),
    streamCategoryId: Number(formData.get("streamCategoryId")),
    tags: JSON.parse((formData.get("tags") as string) || "[]"),
  });

  if (!results.success) {
    return {
      success: false,
      error: "입력값이 올바르지 않습니다.",
    };
  }

  const {
    title,
    description,
    thumbnail,
    visibility,
    password,
    streamCategoryId,
    tags,
  } = results.data;

  try {
    // Cloudflare 스트리밍 생성
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${process.env.NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID}/stream/live_inputs`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_CLOUDFLARE_IMAGE_TOKEN}`,
        },
        body: JSON.stringify({
          meta: {
            name: title,
          },
          recording: {
            mode: "automatic",
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to create Cloudflare stream");
    }

    const data = await response.json();
    const session = await getSession();

    // DB에 스트리밍 정보 저장 - 상태를 CREATED로 변경
    const stream = await db.liveStream.create({
      data: {
        title,
        description,
        thumbnail,
        visibility,
        password,
        stream_id: data.result.uid,
        stream_key: data.result.rtmps.streamKey,
        status: STREAM_STATUS.CREATED, // 생성 상태로 변경
        last_status_check: new Date(),
        userId: session.id!,
        streamCategoryId,
        tags: tags
          ? {
              connectOrCreate: tags.map((tag) => ({
                where: { name: tag },
                create: { name: tag },
              })),
            }
          : undefined,
      },
      select: {
        id: true,
      },
    });

    // 라이브 스트리밍 채팅방 생성
    await createStreamChatRoom(stream.id);

    revalidateTag("stream-list");
    return {
      success: true,
      streamId: stream.id,
      streamKey: data.result.rtmps.streamKey,
      rtmpUrl: data.result.rtmps.url,
    };
  } catch (error) {
    console.error("Failed to create stream:", error);
    return {
      success: false,
      error: "스트리밍 생성에 실패했습니다.",
    };
  }
};

// 클라우드 플레어 이미지에 업로드 할 수 있는 주소를 제공하는 함수
export const getUploadUrl = async () => {
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${process.env.NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID}/images/v2/direct_upload`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_CLOUDFLARE_IMAGE_TOKEN}`,
      },
    }
  );
  const data = await response.json();
  return data;
};
