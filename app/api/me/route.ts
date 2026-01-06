/**
 * File Name : app/api/me/route
 * Description : 현재 로그인 유저 최소 정보 조회 API (세션 id 기반 → DB 조회)
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2025.12.12  임도헌   Created   /api/me 엔드포인트 추가
 * 2025.12.12  임도헌   Modified  세션에는 id만 존재 → DB 조회 방식으로 전환, no-store 적용
 * 2026.01.04  임도헌   Modified  Prisma Route Handler runtime=nodejs 명시 + no-store 헤더 상수화
 */

import "server-only";
import { NextResponse } from "next/server";
import getSession from "@/lib/session";
import db from "@/lib/db";

/**
 * Prisma(Route Handler) 안전을 위해 Node.js 런타임 명시.
 * (Edge로 실행되면 Prisma가 동작하지 않거나 런타임 오류 가능)
 */
export const runtime = "nodejs";

/**
 * 세션/쿠키 기반 응답 + 사용자 개인화 데이터 → 항상 동적
 * 또한 /api/me는 클라이언트 부팅(알림 등)에서 잦게 호출되므로 브라우저 캐시는 금지.
 */
export const dynamic = "force-dynamic";
export const revalidate = 0;

const NO_STORE_HEADERS = { "Cache-Control": "no-store" } as const;

export type MeResponse =
  | {
      ok: true;
      user: {
        id: number;
        username: string;
        avatar: string | null;
        emailVerified: boolean;
      };
    }
  | { ok: false; user: null; error: "UNAUTHORIZED" };

export async function GET() {
  const session = await getSession();
  const userId = session?.id ?? null;

  if (!userId) {
    return NextResponse.json<MeResponse>(
      { ok: false, user: null, error: "UNAUTHORIZED" },
      { status: 401, headers: NO_STORE_HEADERS }
    );
  }

  const me = await db.user.findUnique({
    where: { id: userId },
    select: { id: true, username: true, avatar: true, emailVerified: true },
  });

  // 세션은 있는데 유저가 없으면(삭제/정합성 깨짐) 401로 동일 처리
  if (!me) {
    return NextResponse.json<MeResponse>(
      { ok: false, user: null, error: "UNAUTHORIZED" },
      { status: 401, headers: NO_STORE_HEADERS }
    );
  }

  return NextResponse.json<MeResponse>(
    {
      ok: true,
      user: {
        id: me.id,
        username: me.username,
        avatar: me.avatar ?? null,
        emailVerified: !!me.emailVerified,
      },
    },
    { headers: NO_STORE_HEADERS }
  );
}
