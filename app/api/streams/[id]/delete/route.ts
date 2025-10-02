/**
 * File Name : app/api/streams/[id]/delete/route
 * Description : 방송 삭제 API (소유자 검증) — 비즈니스 로직은 lib/stream/delete/deleteBroadcast 사용
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2025.09.15  임도헌   Created   기본 삭제 라우트
 * 2025.09.17  임도헌   Modified  비즈니스 로직 분리(refactor): deleteBroadcastTx 호출 구조
 */

import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import getSession from "@/lib/session";
import { deleteBroadcastTx } from "@/lib/stream/delete/deleteBroadcast";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session?.id) {
      return NextResponse.json(
        { success: false, error: "로그인이 필요합니다." },
        { status: 401 }
      );
    }

    const search = new URL(req.url).searchParams;
    const uid = search.get("uid") || ""; // LiveInput.provider_uid(선택 검증)
    const idNum = Number(params.id);

    if (!Number.isFinite(idNum)) {
      return NextResponse.json(
        { success: false, error: "잘못된 요청입니다.(id 누락/유효하지 않음)" },
        { status: 400 }
      );
    }

    // 방송 + 채널(소유자) + 상태/uid 조회
    const row = await db.broadcast.findUnique({
      where: { id: idNum },
      select: {
        id: true,
        status: true,
        liveInput: { select: { userId: true, provider_uid: true } },
      },
    });

    if (!row || !row.liveInput) {
      return NextResponse.json(
        { success: false, error: "존재하지 않는 방송입니다." },
        { status: 404 }
      );
    }

    // uid 교차검증(선택)
    if (uid && uid !== row.liveInput.provider_uid) {
      return NextResponse.json(
        { success: false, error: "잘못된 요청입니다.(uid 불일치)" },
        { status: 400 }
      );
    }

    // 소유자 검증
    if (row.liveInput.userId !== session.id) {
      return NextResponse.json(
        { success: false, error: "삭제 권한이 없습니다." },
        { status: 403 }
      );
    }

    // 방송 중(CONNECTED)에는 삭제 금지
    if (row.status?.toUpperCase() === "CONNECTED") {
      return NextResponse.json(
        { success: false, error: "방송 중에는 삭제할 수 없습니다." },
        { status: 400 }
      );
    }

    // ⚙️ 비즈니스 로직 호출 — VodAsset → Broadcast 삭제(트랜잭션)
    await db.$transaction(async (tx) => {
      const res = await deleteBroadcastTx(tx, idNum);
      if (!res.success) {
        throw new Error(res.error || "삭제 실패");
      }
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/streams/:id/delete] failed:", err);
    return NextResponse.json(
      { success: false, error: "방송 삭제 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
