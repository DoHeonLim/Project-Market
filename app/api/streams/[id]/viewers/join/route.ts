/**
File Name : app/api/streams/[id]/viewers/join/route.ts
Description : 실시간 방송 접속 체크
Author : 임도헌

History
Date        Author   Status    Description
2025.05.22  임도헌   Created
2025.05.22  임도헌   Modified  실시간 방송 접속 체크 API 추가
*/

import db from "@/lib/db";
import getSession from "@/lib/session";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session) {
    return new Response(JSON.stringify({ message: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const id = params.id;
  const userId = session.id!;

  try {
    // 기존에 저장되어 있다면 들어온 시간 새로 업데이트, 나간시간 초기화, 아니라면 새로 만든다.
    await db.streamViewer.upsert({
      where: { userId_streamId: { streamId: Number(id), userId } },
      update: { joinedAt: new Date(), leftAt: null },
      create: {
        streamId: Number(id),
        userId,
      },
    });
    return new Response(
      JSON.stringify({ message: `Success for stream ${id}` }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: `Error joining viewer` }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
