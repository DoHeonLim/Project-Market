/**
 * File Name : app/api/cron/check-badge/route
 * Description : Vercel Cron – 활동 기반 뱃지(항구 축제/보드게임 탐험가) 주기적 점검
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2025.12.03  임도헌   Created   Vercel Cron용 뱃지 점검 엔드포인트
 * 2025.12.06  임도헌   Modified  chunk처리 추가
 * 2026.01.04  임도헌   Modified  Prisma Route Handler runtime=nodejs 명시
 */

import "server-only";
import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import {
  checkPortFestivalBadge,
  checkBoardExplorerBadge,
} from "@/lib/check-badge-conditions";

export const runtime = "nodejs";

// 유저를 일정 개수 단위로 잘라서 처리하기 위한 chunk 헬퍼
function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

export async function GET(req: NextRequest) {
  // 간단한 보안: Vercel Cron에서 ?secret=... 붙여서 호출하도록 설정
  const cronSecret = process.env.CRON_SECRET_CHECK_BADGE;
  if (cronSecret) {
    const secretFromQuery = req.nextUrl.searchParams.get("secret");
    if (secretFromQuery !== cronSecret) {
      return new NextResponse("Forbidden", { status: 403 });
    }
  }

  const lastMonth = new Date();
  lastMonth.setMonth(lastMonth.getMonth() - 1);

  // 최근 30일 동안 "게시글 / 댓글 / 거래" 중 하나라도 있었던 유저만 대상으로 점검
  const activeUsers = await db.user.findMany({
    where: {
      OR: [
        {
          posts: {
            some: {
              created_at: { gte: lastMonth },
            },
          },
        },
        {
          comments: {
            some: {
              created_at: { gte: lastMonth },
            },
          },
        },
        {
          products: {
            some: {
              created_at: { gte: lastMonth },
              purchase_userId: { not: null },
            },
          },
        },
      ],
    },
    select: { id: true },
  });

  if (activeUsers.length === 0) {
    return NextResponse.json({ ok: true, processedUsers: 0 });
  }

  // 한 번에 50명씩 처리 (필요하면 20, 100 등으로 조정 가능)
  const CHUNK_SIZE = 50;
  const chunks = chunkArray(activeUsers, CHUNK_SIZE);

  let processed = 0;

  for (const chunk of chunks) {
    // chunk 안에서는 병렬 처리
    await Promise.all(
      chunk.map((user) =>
        Promise.all([
          checkPortFestivalBadge(user.id),
          checkBoardExplorerBadge(user.id),
        ]).catch((error) => {
          console.error(
            "[cron/check-badge] userId:",
            user.id,
            " badge check error:",
            error
          );
        })
      )
    );

    processed += chunk.length;
    if (process.env.NODE_ENV !== "production") {
      console.log(
        `[cron/check-badge] processed ${processed}/${activeUsers.length} users`
      );
    }
  }

  return NextResponse.json({
    ok: true,
    totalUsers: activeUsers.length,
    processedUsers: processed,
  });
}
