/**
 * File Name : lib/push-notification.ts
 * Description : 푸시 알림 라이브러리
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2024.12.20  임도헌   Created
 * 2024.12.22  임도헌   Modified  푸시 알림 라이브러리 추가
 * 2025.01.12  임도헌   Modified  푸시 알림 이미지 추가
 */

import webPush from "web-push";
import db from "@/lib/db";

type NotificationType = "CHAT" | "TRADE" | "REVIEW" | "SYSTEM" | "BADGE";

interface SendNotificationProps {
  targetUserId: number;
  title: string;
  message: string;
  url?: string;
  type: NotificationType;
  image?: string;
}

export async function sendPushNotification({
  targetUserId,
  title,
  message,
  url,
  type,
  image,
}: SendNotificationProps) {
  try {
    // 유저의 활성화된 푸시 구독 정보 가져오기
    const subscriptions = await db.pushSubscription.findMany({
      where: {
        userId: targetUserId,
        isActive: true,
      },
    });

    if (!subscriptions.length) {
      return { success: true, message: "No active subscriptions" };
    }

    // VAPID 설정
    webPush.setVapidDetails(
      "mailto:test@email.com",
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
      process.env.VAPID_PRIVATE_KEY!
    );

    // 모든 구독에 푸시 알림 전송
    await Promise.all(
      subscriptions.map(async (subscription) => {
        try {
          await webPush.sendNotification(
            {
              endpoint: subscription.endpoint,
              keys: {
                p256dh: subscription.p256dh,
                auth: subscription.auth,
              },
            },
            JSON.stringify({
              title,
              body: message,
              link: url,
              type,
              image,
            })
          );
        } catch (error: any) {
          if (error.statusCode === 410) {
            // 구독이 만료된 경우 삭제
            await db.pushSubscription.delete({
              where: { id: subscription.id },
            });
          }
          console.error("Push notification error:", error);
        }
      })
    );

    return { success: true };
  } catch (error) {
    console.error("Send notification error:", error);
    throw error;
  }
}
