/**
File Name : app/api/push/subscribe/route.ts
Description : 푸시 알림 구독 API
Author : 임도헌

History
Date        Author   Status    Description
2024.12.22  임도헌   Created
2024.12.22  임도헌   Modified  푸시 알림 구독 API 추가
*/

import { NextResponse } from "next/server";
import webPush from "web-push";
import getSession from "@/lib/session";
import db from "@/lib/db";

// VAPID 설정
webPush.setVapidDetails(
  "mailto:test@email.com",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function POST(req: Request) {
  try {
    const session = await getSession();
    const userId = session?.id;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const subscription = await req.json();
    const userAgent = req.headers.get("user-agent");

    // Prisma를 사용하여 구독 정보 저장
    await db.pushSubscription.upsert({
      where: {
        endpoint_userId: {
          endpoint: subscription.endpoint,
          userId,
        },
      },
      update: {
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
        userAgent,
        isActive: true,
        updated_at: new Date(),
      },
      create: {
        userId,
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
        userAgent,
      },
    });

    // 알림 설정도 함께 생성/업데이트
    await db.notificationPreferences.upsert({
      where: {
        userId,
      },
      update: {
        pushEnabled: true,
      },
      create: {
        userId,
        pushEnabled: true,
      },
    });

    // 구독 성공 시 테스트 알림 생성 및 전송
    const notification = await db.notification.create({
      data: {
        userId,
        title: "알림 설정 완료",
        body: "푸시 알림 설정이 완료되었습니다.",
        type: "SYSTEM",
        link: "/settings/notifications",
        isPushSent: true,
        sentAt: new Date(),
      },
    });

    // 테스트 푸시 알림 전송
    await webPush.sendNotification(
      subscription,
      JSON.stringify({
        title: notification.title,
        message: notification.body,
        url: notification.link,
        tag: "welcome",
      })
    );

    return NextResponse.json(
      { message: "Successfully subscribed to push notifications" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Push subscription error:", error);
    return NextResponse.json(
      { error: "Failed to subscribe to push notifications" },
      { status: 500 }
    );
  }
}
