/**
File Name : app/api/push/unsubscribe/route.ts
Description : 푸시 알림 구독 해제 API
Author : 임도헌

History
Date        Author   Status    Description
2024.12.22  임도헌   Created
2024.12.22  임도헌   Modified  푸시 알림 구독 해제 API 추가
*/

import { NextResponse } from "next/server";
import db from "@/lib/db";
import getSession from "@/lib/session";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { endpoint } = await req.json();

    // 먼저 구독 정보가 있는지 확인
    const subscription = await db.pushSubscription.findFirst({
      where: {
        AND: [{ endpoint }, { userId: session.id }],
      },
    });

    if (!subscription) {
      // 구독 정보가 없으면 이미 해제된 것으로 간주
      return NextResponse.json({ success: true });
    }

    // 구독 정보가 있으면 삭제
    await db.pushSubscription.delete({
      where: {
        id: subscription.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Push unsubscription error:", error);
    return NextResponse.json(
      { error: "Failed to unsubscribe" },
      { status: 500 }
    );
  }
}
