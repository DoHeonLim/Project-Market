/**
File Name : app/api/users/[id]/follow/route.ts
Description : 팔로우 추가 삭제 API
Author : 임도헌

History
Date        Author   Status    Description
2025.05.22  임도헌   Created
2025.05.22  임도헌   Modified  팔로우 추가 삭제 API 추가
*/

import db from "@/lib/db";
import getSession from "@/lib/session";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const userId = parseInt(params.id);
    if (isNaN(userId)) {
      return new NextResponse("Invalid user ID", { status: 400 });
    }

    // 자기 자신을 팔로우할 수 없음
    if (session.id === userId) {
      return new NextResponse("Cannot follow yourself", { status: 400 });
    }

    // 이미 팔로우 중인지 확인
    const existingFollow = await db.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: session.id,
          followingId: userId,
        },
      },
    });

    if (existingFollow) {
      return new NextResponse("Already following", { status: 400 });
    }

    // 팔로우 생성
    await db.follow.create({
      data: {
        followerId: session.id,
        followingId: userId,
      },
    });

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
    if (!session?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const userId = parseInt(params.id);
    if (isNaN(userId)) {
      return new NextResponse("Invalid user ID", { status: 400 });
    }

    // 팔로우 관계 삭제
    await db.follow.delete({
      where: {
        followerId_followingId: {
          followerId: session.id,
          followingId: userId,
        },
      },
    });

    return new NextResponse("Unfollowed successfully", { status: 200 });
  } catch (error) {
    console.error("[FOLLOW_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
