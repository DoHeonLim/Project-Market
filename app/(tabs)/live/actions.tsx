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
 */

import db from "@/lib/db";

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
