/**
File Name : app/api/users/[id]/follow/route.ts
Description : 팔로우 추가 삭제 API
Author : 임도헌

History
Date        Author   Status    Description
2025.05.22  임도헌   Created
2025.05.22  임도헌   Modified  팔로우 추가 삭제 API 추가
2025.09.24  임도헌   Modified  캐시 무효화만 추가
*/
import { revalidateTag } from "next/cache";
import db from "@/lib/db";
import getSession from "@/lib/session";
import { NextResponse } from "next/server";

const rvAfterFollow = (viewerId: number, targetId: number) => {
  revalidateTag("broadcast-list");
  revalidateTag(`user-broadcasts-${targetId}`);
  revalidateTag(`user-broadcasts-${viewerId}`);
};

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session?.id) return new NextResponse("Unauthorized", { status: 401 });

    const userId = parseInt(params.id);
    if (!Number.isFinite(userId)) {
      return new NextResponse("Invalid user ID", { status: 400 });
    }
    if (session.id === userId) {
      return new NextResponse("Cannot follow yourself", { status: 400 });
    }

    const existing = await db.follow.findUnique({
      where: {
        followerId_followingId: { followerId: session.id, followingId: userId },
      },
    });

    if (existing) {
      // 멱등: 그래도 캐시 무효화는 해주는 편이 안전 (동일 뷰어 키 캐시가 있을 수 있음)
      rvAfterFollow(session.id, userId);
      return new NextResponse("Already following", { status: 200 });
    }

    await db.follow.create({
      data: { followerId: session.id, followingId: userId },
    });

    rvAfterFollow(session.id, userId);
    return new NextResponse("Followed successfully", { status: 200 });
  } catch (error) {
    console.error("[FOLLOW_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session?.id) return new NextResponse("Unauthorized", { status: 401 });

    const userId = parseInt(params.id);
    if (!Number.isFinite(userId)) {
      return new NextResponse("Invalid user ID", { status: 400 });
    }

    await db.follow.deleteMany({
      where: { followerId: session.id, followingId: userId },
    });

    rvAfterFollow(session.id, userId);
    return new NextResponse("Unfollowed successfully", { status: 200 });
  } catch (error) {
    console.error("[FOLLOW_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
