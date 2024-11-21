/**
 File Name : app/(tabs)/live/actions
 Description : 라이브 서버 코드
 Author : 임도헌
 
 History
 Date        Author   Status    Description
 2024.11.12  임도헌   Created
 2024.11.12  임도헌   Modified  라이브 서버 코드 분리
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
  console.log("------------------------------------------");
  console.log("방송 리스트");
  console.log(list);
  console.log("------------------------------------------");
  console.log("방송 리스트의 방송 이름");
  console.log(list.result[0].meta.name);
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
  });
  // console.log(liveStreams);
  return liveStreams;
};

// 라이브 스트리밍의 현재 상태
export const streamStatus = async (streamId: string) => {
  console.log(streamId);
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${process.env.NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID}/stream/live_inputs/${streamId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_CLOUDFLARE_IMAGE_TOKEN}`,
      },
    }
  );
  //   console.log("------------------------------------------");
  //   console.log("방송 상태");
  const status = await response.json();
  //   console.log("------------------------------------------");
  //   console.log("방송 연결 상태");
  //   console.log(status.result.status.current.state);
  //   console.log("------------------------------------------");
  //   console.log("방송 연결 역사");
  //   console.log(status.result.status.current);
  return status;
};