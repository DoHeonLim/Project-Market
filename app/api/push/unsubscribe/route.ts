/**
 * File Name : app/api/push/unsubscribe/route
 * Description : 푸시 알림 구독 해제 API (global OFF)
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2024.12.22  임도헌   Created
 * 2024.12.22  임도헌   Modified  푸시 알림 구독 해제 API 추가
 * 2025.12.21  임도헌   Modified  pushEnabled=false + 모든 구독 isActive=false (전역 OFF)
 * 2026.01.04  임도헌   Modified  Prisma Route Handler runtime=nodejs 명시
 */

import { NextResponse } from "next/server";
import db from "@/lib/db";
import getSession from "@/lib/session";

export const runtime = "nodejs";

export async function POST() {
  try {
    const session = await getSession();
    const userId = session?.id;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 전역 푸시 OFF
    // - NotificationPreferences.pushEnabled = false
    // - 해당 유저의 모든 PushSubscription.isActive = false
    await db.$transaction(async (tx) => {
      await tx.notificationPreferences.upsert({
        where: { userId },
        update: { pushEnabled: false },
        create: { userId, pushEnabled: false },
      });

      await tx.pushSubscription.updateMany({
        where: { userId, isActive: true },
        data: { isActive: false },
      });
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
