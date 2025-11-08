/**
 * File Name : app/api/users/[id]/info/route
 * Description : 특정 유저의 최소 프로필 정보(id/username/avatar) 조회 API
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2025.10.22  임도헌   Created   공개 필드만 반환하는 라이트 엔드포인트 추가(SSR 캐시 영향 없음)
 */

import { NextResponse } from "next/server";
import db from "@/lib/db";

type Params = { params: { id: string } };

export async function GET(_req: Request, { params }: Params) {
  const idNum = Number(params.id);
  if (!idNum || Number.isNaN(idNum)) {
    return NextResponse.json(
      { ok: false, error: "Invalid id" },
      { status: 400 }
    );
  }

  const user = await db.user.findUnique({
    where: { id: idNum },
    select: { id: true, username: true, avatar: true },
  });

  if (!user) {
    return NextResponse.json(
      { ok: false, error: "User not found" },
      { status: 404 }
    );
  }

  return new NextResponse(JSON.stringify({ ok: true, user }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store, max-age=0",
    },
  });
}
