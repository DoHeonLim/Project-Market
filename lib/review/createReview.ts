/**
 * File Name : lib/review/createReview
 * Description : 리뷰 생성 서버 액션 (도메인 분리)
 * Author : 임도헌
 *
 * History
 * Date        Author   Status     Description
 * 2024.12.23  임도헌   Created
 * 2024.12.23  임도헌   Modified  리뷰 생성, 삭제 추가
 * 2025.01.12  임도헌   Modified  푸시 알림 이미지 링크 변경
 * 2025.02.02  임도헌   Modified  PowerSeller 뱃지 체크 기능 추가(리뷰 추가할 때 체크)
 * 2025.03.30  임도헌   Modified  GenreMaster 뱃지 체크 기능 추가
 * 2025.04.10  임도헌   Modified  FairTrader 뱃지 체크 기능 추가
 * 2025.10.19  임도헌   Moved      app/(tabs)/profile/(product)/actions → lib/review/createReview 로 파일 이동
 * 2025.10.19  임도헌   Modified   도메인 정리 및 import 정리
 * 2025.11.05  임도헌   Modified   세션 기반 userId 강제, 자격 검증, 중복 방지, rate/payload 검증, null-safe 알림
 */

"use server";

import db from "@/lib/db";
import { sendPushNotification } from "@/lib/push-notification";
import { supabase } from "@/lib/supabase";
import { revalidateTag } from "next/cache";
import getSession from "@/lib/session";
import {
  checkPowerSellerBadge,
  checkGenreMasterBadge,
  checkFairTraderBadge,
} from "@/lib/check-badge-conditions";

function assert(cond: any, msg: string): asserts cond {
  if (!cond) throw new Error(msg);
}

export async function createReview(
  productId: number,
  payload: string,
  rate: number,
  type: "buyer" | "seller"
) {
  try {
    const session = await getSession();
    assert(session?.id, "로그인이 필요합니다.");

    // 입력 검증
    const text = (payload ?? "").trim();
    assert(
      text.length >= 2 && text.length <= 1000,
      "리뷰는 2~1000자여야 합니다."
    );
    assert(
      Number.isFinite(rate) && rate >= 1 && rate <= 5,
      "별점은 1~5 사이여야 합니다."
    );

    // 제품/권한 컨텍스트
    const prod = await db.product.findUnique({
      where: { id: productId },
      select: {
        id: true,
        title: true,
        userId: true, // seller
        purchase_userId: true, // buyer
        images: { take: 1, select: { url: true } },
        user: {
          select: {
            badges: {
              where: {
                name: { in: ["POWER_SELLER", "GENRE_MASTER", "FAIR_TRADER"] },
              },
              select: { name: true },
            },
          },
        },
      },
    });
    assert(prod, "상품을 찾을 수 없습니다.");

    // 작성 자격 검증
    if (type === "buyer") {
      assert(
        prod.purchase_userId !== null,
        "판매완료 상태에서만 구매자 리뷰가 가능합니다."
      );
      assert(
        prod.purchase_userId === session.id,
        "구매자만 리뷰를 작성할 수 있습니다."
      );
    } else {
      assert(prod.userId === session.id, "판매자만 리뷰를 작성할 수 있습니다.");
    }

    // 중복 리뷰 방지(한 유저가 한 상품에 1회)
    const dup = await db.review.findFirst({
      where: { userId: session.id, productId },
      select: { id: true },
    });
    assert(!dup, "이미 이 상품에 리뷰를 작성하셨습니다.");

    // 생성
    const review = await db.review.create({
      data: { userId: session.id, productId, payload: text, rate },
      include: {
        user: { select: { username: true } },
      },
    });

    // 배지 체크
    if (type === "buyer") {
      const sellerBadges = new Set(prod.user.badges.map((b) => b.name));
      if (!sellerBadges.has("POWER_SELLER"))
        await checkPowerSellerBadge(prod.userId);
      if (!sellerBadges.has("GENRE_MASTER"))
        await checkGenreMasterBadge(prod.userId);
      if (!sellerBadges.has("FAIR_TRADER"))
        await checkFairTraderBadge(prod.userId);
    } else if (type === "seller" && prod.purchase_userId) {
      const buyer = await db.user.findUnique({
        where: { id: prod.purchase_userId },
        select: {
          badges: { where: { name: "GENRE_MASTER" }, select: { name: true } },
        },
      });
      if (!buyer?.badges?.length)
        await checkGenreMasterBadge(prod.purchase_userId);
    }

    // 알림 (수신자 환경설정 + 이미지 null-safe)
    const targetUserId =
      type === "buyer" ? prod.userId : (prod.purchase_userId ?? null);
    if (targetUserId) {
      const receiver = await db.user.findUnique({
        where: { id: targetUserId },
        select: { notification_preferences: true },
      });

      if (receiver?.notification_preferences?.review) {
        const imageUrl = prod.images?.[0]?.url
          ? `${prod.images[0].url}/public`
          : undefined;
        const link =
          type === "buyer" ? "/profile/my-sales" : "/profile/my-purchases";

        const notification = await db.notification.create({
          data: {
            userId: targetUserId,
            title: "새로운 리뷰가 작성되었습니다",
            body: `${review.user.username}님이 ${prod.title}에 리뷰를 작성했습니다: "${text.slice(0, 30)}${text.length > 30 ? "..." : ""}"`,
            type: "REVIEW",
            link,
            image: imageUrl,
          },
        });

        await Promise.all([
          supabase.channel("notifications").send({
            type: "broadcast",
            event: "notification",
            payload: notification,
          }),
          sendPushNotification({
            targetUserId,
            title: notification.title,
            message: notification.body,
            url: notification.link || "",
            type: "REVIEW",
            image: notification.image || "",
          }),
        ]);
      }
    }

    // 캐시 무효화
    if (type === "buyer") {
      revalidateTag(`user-average-rating-id-${prod.userId}`);
      revalidateTag(`user-reviews-initial-id-${prod.userId}`);
      revalidateTag(`user-badges-id-${prod.userId}`);
    } else if (prod.purchase_userId) {
      revalidateTag(`user-badges-id-${prod.purchase_userId}`);
    }

    return {
      success: true,
      review: {
        id: review.id,
        rate: review.rate,
        payload: review.payload,
        userId: review.userId,
        productId: productId,
      },
    };
  } catch (error) {
    console.error("리뷰 작성 중 오류:", error);
    const msg =
      error instanceof Error ? error.message : "리뷰 작성에 실패했습니다.";
    return { success: false, error: msg };
  }
}
