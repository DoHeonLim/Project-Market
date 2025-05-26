/**
File Name : app/api/streams/[id]/viewers/leave/route.ts
Description : 실시간 방송 나간시간 체크크
Author : 임도헌

History
Date        Author   Status    Description
2025.05.22  임도헌   Created
2025.05.22  임도헌   Modified  실시간 방송 나간 시간 체크 API 추가
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
    // 나간시간 업데이트
    await db.streamViewer.update({
      where: { userId_streamId: { streamId: Number(id), userId } },
      data: {
        leftAt: new Date(),
      },
    });
    return new Response(JSON.stringify({ message: `Viewer left` }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: `Error leaving viewer` }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
