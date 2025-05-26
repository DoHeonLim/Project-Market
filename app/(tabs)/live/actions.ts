/**
 File Name : app/(tabs)/live/actions
 Description : 라이브 서버 코드
 Author : 임도헌
 
 History
 Date        Author   Status    Description
 2024.11.12  임도헌   Created
 2024.11.12  임도헌   Modified  라이브 서버 코드 분리
 2024.11.21  임도헌   Modified  console.log 제거
 2024.11.23  임도헌   Modified  listStream 최신순으로 정렬
 2025.04.18  임도헌   Modified  스트리밍 상태 관리 기능 추가
 2025.05.23  임도헌   Modified  팔로우 관련 기능 추가
 */

import db from "@/lib/db";
import getSession from "@/lib/session";

// 스트리밍 리스트 안써도될듯
export const listStream = async () => {
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${process.env.NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID}/stream/live_inputs`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_CLOUDFLARE_IMAGE_TOKEN}`,
      },
    }
  );
  const list = await response.json();
  return list;
};

// 데이터베이스에 저장된 라이브 스트리밍
export const getLiveStreams = async () => {
  const liveStreams = await db.liveStream.findMany({
    select: {
      id: true,
      title: true,
      stream_id: true,
      status: true,
      last_status_check: true,
      user: {
        select: {
          username: true,
          avatar: true,
        },
      },
    },
    orderBy: {
      created_at: "desc",
    },
  });
  return liveStreams;
};

// 라이브 스트리밍의 현재 상태
export const streamStatus = async (streamId: string) => {
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
  return status;
};

// 스트리밍 상태 업데이트
export const updateStreamStatus = async (streamId: string) => {
  try {
    const cloudflareStatus = await streamStatus(streamId);
    const currentState = cloudflareStatus?.result?.status?.current?.state;

    if (!currentState) {
      throw new Error("Failed to get stream status");
    }

    // 상태에 따른 StreamStatus 값 매핑
    let status;
    switch (currentState) {
      case "connected":
        status = "CONNECTED";
        break;
      case "disconnected":
        status = "DISCONNECTED";
        break;
      default:
        status = "FAILED";
    }

    // DB 업데이트
    const stream = await db.liveStream.findFirst({
      where: { stream_id: streamId },
    });

    if (!stream) {
      throw new Error("Stream not found");
    }

    await db.liveStream.update({
      where: { id: stream.id },
      data: {
        status: status,
        last_status_check: new Date(),
        // 상태가 connected로 변경되면 started_at 업데이트
        ...(status === "CONNECTED" && !cloudflareStatus?.result?.started_at
          ? { started_at: new Date() }
          : {}),
        // 상태가 disconnected로 변경되면 ended_at 업데이트
        ...(status === "DISCONNECTED" && !cloudflareStatus?.result?.ended_at
          ? { ended_at: new Date() }
          : {}),
      },
    });

    return { success: true, status };
  } catch (error) {
    console.error("Failed to update stream status:", error);
    return { success: false, error };
  }
};

// 내가 팔로우한 유저의 실시간 방송만 조회
export const getFollowingStreams = async () => {
  const session = await getSession();
  if (!session?.id) return [];

  // 내가 팔로우한 유저 id 목록
  const following = await db.follow.findMany({
    where: { followerId: session.id },
    select: { followingId: true },
  });
  const followingIds = following.map((f) => f.followingId);

  if (followingIds.length === 0) return [];

  // 해당 유저들의 실시간 방송만 조회
  const streams = await db.liveStream.findMany({
    where: {
      userId: { in: followingIds },
      status: "CONNECTED",
    },
    include: {
      user: { select: { id: true, username: true, avatar: true } },
      category: true,
      tags: true,
    },
    orderBy: { created_at: "desc" },
  });

  // isFollowing: true, isMine 추가
  return streams.map((stream) => ({
    ...stream,
    isFollowing: true,
    isMine: session.id === stream.user.id,
  }));
};
