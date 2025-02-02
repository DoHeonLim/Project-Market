/**
File Name : app/(tabs)/profile/(product)/actions.ts
Description : 프로필 제품 리뷰 서버 코드
Author : 임도헌

History
Date        Author   Status    Description
2024.12.23  임도헌   Created
2024.12.23  임도헌   Modified  리뷰 생성, 삭제 추가
2025.01.12  임도헌   Modified  푸시 알림 이미지 링크 변경
2025.02.02  임도헌   Modified  PowerSeller 뱃지 체크 기능 추가(리뷰 추가할 때 체크)
*/
"use server";

import db from "@/lib/db";
import { sendPushNotification } from "@/lib/push-notification";
import { supabase } from "@/lib/supabase";
import { revalidateTag } from "next/cache";
import { checkPowerSellerBadge } from "@/lib/check-badge-conditions";

// 통합된 리뷰 생성 함수
export const createReview = async (
  userId: number,
  productId: number,
  payload: string,
  rate: number,
  type: "buyer" | "seller"
) => {
  try {
    const review = await db.review.create({
      data: {
        userId,
        productId,
        payload,
        rate,
      },
      include: {
        product: {
          select: {
            title: true,
            userId: true,
            purchase_userId: true,
            user: {
              select: {
                badges: {
                  where: {
                    name: "POWER_SELLER",
                  },
                  select: {
                    name: true,
                  },
                },
              },
            },
            images: {
              take: 1,
              select: {
                url: true,
              },
            },
          },
        },
        user: {
          select: {
            username: true,
          },
        },
      },
    });

    // 구매자의 리뷰이고, 판매자가 아직 POWER_SELLER 뱃지가 없는 경우에만 체크
    if (type === "buyer" && !review.product.user.badges.length) {
      await checkPowerSellerBadge(review.product.userId);
    }

    // 알림을 받을 사용자 ID와 링크 설정
    const notificationData =
      type === "buyer"
        ? {
            userId: review.product.userId, // 판매자에게 알림
            link: `/profile/my-sales`,
          }
        : {
            userId: review.product.purchase_userId!, // 구매자에게 알림
            link: `/profile/my-purchases`,
          };

    // 알림을 받을 사용자의 알림 설정 확인
    const receiver = await db.user.findUnique({
      where: { id: notificationData.userId },
      select: {
        notification_preferences: true,
      },
    });

    // 알림 설정이 켜져있는 경우에만 알림 전송
    if (receiver?.notification_preferences?.review) {
      const notification = await db.notification.create({
        data: {
          userId: notificationData.userId,
          title: "새로운 리뷰가 작성되었습니다",
          body: `${review.user.username}님이 ${
            review.product.title
          } 상품에 리뷰를 작성했습니다: "${payload.slice(0, 30)}${
            payload.length > 30 ? "..." : ""
          }"`,
          type: "REVIEW",
          link: notificationData.link,
          image: `${review.product.images[0]?.url}/public`,
        },
      });

      await Promise.all([
        supabase.channel("notifications").send({
          type: "broadcast",
          event: "notification",
          payload: notification,
        }),
        sendPushNotification({
          targetUserId: notificationData.userId,
          title: notification.title,
          message: notification.body,
          url: notification.link || "",
          type: "REVIEW",
          image: notification.image || "",
        }),
      ]);
    }

    // 타입에 따라 적절한 태그 리밸리데이트
    revalidateTag(
      type === "buyer" ? "purchased-product-list" : "selling-product-list"
    );
    return { success: true };
  } catch (error) {
    console.error("리뷰 작성 중 오류:", error);
    return { success: false, error: "리뷰 작성에 실패했습니다." };
  }
};
