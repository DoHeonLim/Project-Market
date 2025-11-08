/**
 * File Name : app/api/users/[id]/follow/route
 * Description : 팔로우 추가 삭제 API
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2025.05.22  임도헌   Created
 * 2025.05.22  임도헌   Modified  팔로우 추가 삭제 API 추가
 * 2025.09.24  임도헌   Modified  캐시 무효화만 추가
 * 2025.10.23  임도헌   Modified  무효화 태그 표준화
 * 2025.10.31  임도헌   Modified  정합성 응답(counts/isFollowing) + P2002 멱등 처리
 */
import { revalidateTag } from "next/cache";
import db from "@/lib/db";
import getSession from "@/lib/session";
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

function rvAfterFollow(viewerId: number, targetId: number) {
  // 리스트 페이지네이션 캐시
  revalidateTag(`user-following-id-${viewerId}`);
  revalidateTag(`user-followers-id-${targetId}`);
}

async function getCounts(viewerId: number, targetId: number) {
  const [viewerFollowing, targetFollowers] = await Promise.all([
    db.follow.count({ where: { followerId: viewerId } }),
    db.follow.count({ where: { followingId: targetId } }),
  ]);
  return { viewerFollowing, targetFollowers };
}

export async function POST(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session?.id)
      return NextResponse.json(
        { ok: false, error: "UNAUTHORIZED" },
        { status: 401 }
      );

    const userId = Number(params.id);
    if (!Number.isFinite(userId))
      return NextResponse.json(
        { ok: false, error: "INVALID_ID" },
        { status: 400 }
      );
    if (session.id === userId)
      return NextResponse.json(
        { ok: false, error: "SELF_FOLLOW_FORBIDDEN" },
        { status: 400 }
      );

    let changed = false;
    try {
      await db.follow.create({
        data: { followerId: session.id, followingId: userId },
      });
      changed = true;
    } catch (e) {
      if (
        !(
          e instanceof Prisma.PrismaClientKnownRequestError &&
          e.code === "P2002"
        )
      ) {
        throw e;
      }
    }

    rvAfterFollow(session.id, userId);
    const counts = await getCounts(session.id, userId);

    return NextResponse.json(
      {
        ok: true,
        changed,
        status: changed ? "FOLLOWED" : "ALREADY_FOLLOWING",
        delta: changed ? +1 : 0,
        isFollowing: true,
        counts,
      },
      { status: changed ? 201 : 200 }
    );
  } catch (e) {
    console.error("[FOLLOW_POST]", e);
    return NextResponse.json({ ok: false, error: "INTERNAL" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session?.id)
      return NextResponse.json(
        { ok: false, error: "UNAUTHORIZED" },
        { status: 401 }
      );

    const userId = Number(params.id);
    if (!Number.isFinite(userId))
      return NextResponse.json(
        { ok: false, error: "INVALID_ID" },
        { status: 400 }
      );

    const res = await db.follow.deleteMany({
      where: { followerId: session.id, followingId: userId },
    });
    const changed = (res.count ?? 0) > 0;

    rvAfterFollow(session.id, userId);
    const counts = await getCounts(session.id, userId);

    return NextResponse.json(
      {
        ok: true,
        changed,
        status: changed ? "UNFOLLOWED" : "NOT_FOLLOWING",
        delta: changed ? -1 : 0,
        isFollowing: false,
        counts,
      },
      { status: 200 }
    );
  } catch (e) {
    console.error("[FOLLOW_DELETE]", e);
    return NextResponse.json({ ok: false, error: "INTERNAL" }, { status: 500 });
  }
}
