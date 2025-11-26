/**
 * File Name : lib/product/updateProductStatus
 * Description : 제품 상태 변경(판매중/예약중/판매완료) + 캐시 리밸리데이트/알림
 *
 * History
 * 2024.12.07  임도헌   Created
 * 2024.12.12  임도헌   Modified   select 필드 정리
 * 2025.05.23  임도헌   Modified   판매완료 판별 통합
 * 2025.10.08  임도헌   Moved      lib/product/updateProductStatus로 분리
 * 2025.10.19  임도헌   Modified   badge 판별 버그 수정 등
 * 2025.11.02  임도헌   Modified   권한검증 추가, SELLING 캐시 무효화 버그 수정, selectUserId 검증 보강,
 *                                이미지 URL 안전화, 알림 링크 경로 통일(/products/view/:id)
 * 2025.11.10  임도헌   Modified   Supabase 공용 채널→유저 전용 채널 전환, 실시간 payload에 image 포함
 * 2025.11.13  임도헌   Modified  중복예약 차단/판매완료 시 예약필드 정리 정책을 적용,
 *                                알림/푸시 allSettled, 에러 메시지 보강
 */
"use server";

import { revalidateTag } from "next/cache";
import db from "@/lib/db";
import { supabase } from "@/lib/supabase";
import { sendPushNotification } from "@/lib/push-notification";
import getSession from "@/lib/session";
import {
  checkBoardExplorerBadge,
  checkFairTraderBadge,
  checkFirstDealBadge,
  checkGenreMasterBadge,
  checkPortFestivalBadge,
  checkPowerSellerBadge,
  checkQualityMasterBadge,
} from "@/lib/check-badge-conditions";

type Status = "selling" | "reserved" | "sold";

/* ---------------- Revalidate ---------------- */

function rvSellerTabsAndCounts(sellerId: number) {
  revalidateTag(`user-products-SELLING-id-${sellerId}`);
  revalidateTag(`user-products-RESERVED-id-${sellerId}`);
  revalidateTag(`user-products-SOLD-id-${sellerId}`);
  revalidateTag(`user-products-counts-id-${sellerId}`);
}
function rvBuyerPurchasedAndCounts(buyerId: number) {
  revalidateTag(`user-products-PURCHASED-id-${buyerId}`);
  revalidateTag(`user-products-counts-id-${buyerId}`);
}

export async function updateProductStatus(
  productId: number,
  status: Status,
  selectUserId?: number
) {
  try {
    // 권한 체크
    const session = await getSession();
    if (!session?.id) return { success: false, error: "로그인이 필요합니다." };

    const owner = await db.product.findUnique({
      where: { id: productId },
      select: { userId: true },
    });
    if (!owner || owner.userId !== session.id) {
      return { success: false, error: "권한이 없습니다." };
    }

    /* -------- RESERVED (판매중 → 예약중) -------- */
    if (status === "reserved") {
      if (!selectUserId)
        return {
          success: false,
          error: "예약 전환에는 예약자를 선택해야 합니다.",
        };

      // (정책 고정) 이미 예약자가 있으면 차단
      const prev = await db.product.findUnique({
        where: { id: productId },
        select: { reservation_userId: true },
      });
      if (prev?.reservation_userId) {
        return { success: false, error: "이미 예약 중인 상품입니다." };
      }

      // 실제 채팅 상대인지 검증
      const validChatUser = await db.productChatRoom.findFirst({
        where: {
          productId,
          users: { some: { id: session.id } },
          AND: [{ users: { some: { id: selectUserId } } }],
        },
        select: { id: true },
      });
      if (!validChatUser) {
        return {
          success: false,
          error: "채팅 내역이 없는 유저는 예약자로 지정할 수 없습니다.",
        };
      }

      const product = await db.product.update({
        where: { id: productId },
        data: {
          reservation_at: new Date(),
          reservation_userId: selectUserId,
          purchased_at: null,
          purchase_userId: null,
        },
        select: {
          title: true,
          user: { select: { id: true } },
          images: { take: 1, select: { url: true } },
        },
      });

      const imageUrl = product.images?.[0]?.url
        ? `${product.images[0]!.url}/public`
        : undefined;

      const notification = await db.notification.create({
        data: {
          userId: selectUserId,
          title: "상품이 예약되었습니다",
          body: `${product.title} 상품이 예약되었습니다.`,
          type: "TRADE",
          link: `/products/view/${productId}`,
          image: imageUrl,
        },
      });

      await Promise.allSettled([
        supabase.channel(`user-${selectUserId}-notifications`).send({
          type: "broadcast",
          event: "notification",
          payload: {
            userId: selectUserId,
            title: notification.title,
            body: notification.body,
            link: notification.link,
            type: notification.type,
            image: notification.image,
          },
        }),
        sendPushNotification({
          targetUserId: selectUserId,
          title: notification.title,
          message: notification.body,
          url: notification.link || "",
          type: "TRADE",
          image: notification.image || undefined,
          tag: `bp-trade-${productId}`,
          renotify: true,
          topic: `bp-trade-${productId}`,
        }),
      ]);

      rvSellerTabsAndCounts(product.user.id);
      revalidateTag(`product-detail-id-${productId}`);

      return { success: true, newStatus: "reserved" as const };
    }

    /* -------- SOLD (예약중 → 판매완료) -------- */
    if (status === "sold") {
      const info = await db.product.findUnique({
        where: { id: productId },
        select: {
          reservation_userId: true,
          title: true,
          user: {
            select: {
              id: true,
              username: true,
              badges: {
                select: { name: true },
                where: {
                  name: {
                    in: [
                      "FIRST_DEAL",
                      "POWER_SELLER",
                      "FAIR_TRADER",
                      "GENRE_MASTER",
                      "QUALITY_MASTER",
                    ],
                  },
                },
              },
            },
          },
          images: { take: 1, select: { url: true } },
        },
      });

      if (!info?.reservation_userId) {
        return {
          success: false,
          error:
            "구매자(예약자)가 지정되어 있지 않아 판매완료로 전환할 수 없습니다.",
        };
      }

      await db.product.update({
        where: { id: productId },
        data: {
          purchased_at: new Date(),
          purchase_userId: info.reservation_userId,
          // (정책 고정) 판매완료 시 예약 흔적 정리
          reservation_at: null,
          reservation_userId: null,
        },
      });

      // 배지 체크
      const buyerBadges = await db.user.findUnique({
        where: { id: info.reservation_userId },
        select: { badges: { select: { name: true } } },
      });

      const sellerFirstDeal = info.user.badges.some(
        (b) => b.name === "FIRST_DEAL"
      );
      const buyerFirstDeal = buyerBadges?.badges.some(
        (b) => b.name === "FIRST_DEAL"
      );

      const sellerTradeCount = await db.product.count({
        where: { userId: info.user.id, purchase_userId: { not: null } },
      });

      const badgeTasks: Promise<any>[] = [];
      if (!sellerFirstDeal) badgeTasks.push(checkFirstDealBadge(info.user.id));
      if (!buyerFirstDeal)
        badgeTasks.push(checkFirstDealBadge(info.reservation_userId));

      const sellerBadgeSet = new Set(info.user.badges.map((b) => b.name));
      const sellerHasTier =
        sellerBadgeSet.has("POWER_SELLER") ||
        sellerBadgeSet.has("FAIR_TRADER") ||
        sellerBadgeSet.has("GENRE_MASTER");

      if (!sellerHasTier && sellerTradeCount >= 14) {
        badgeTasks.push(checkGenreMasterBadge(info.user.id));
        badgeTasks.push(checkGenreMasterBadge(info.reservation_userId));
      } else if (!sellerHasTier && sellerTradeCount >= 9) {
        badgeTasks.push(checkPowerSellerBadge(info.user.id));
      } else if (!sellerHasTier && sellerTradeCount >= 4) {
        badgeTasks.push(checkFairTraderBadge(info.user.id));
        badgeTasks.push(checkQualityMasterBadge(info.user.id));
      }

      const imageUrl = info.images?.[0]?.url
        ? `${info.images[0]!.url}/public`
        : undefined;

      const [sellerNotification, buyerNotification] = await Promise.all([
        db.notification.create({
          data: {
            userId: info.user.id,
            title: "상품이 판매되었습니다",
            body: `${info.title} 상품이 판매되었습니다.`,
            type: "TRADE",
            link: `/products/view/${productId}`,
            image: imageUrl,
          },
        }),
        db.notification.create({
          data: {
            userId: info.reservation_userId,
            title: "상품 구매가 완료되었습니다",
            body: `${info.title} 상품의 구매가 완료되었습니다. 리뷰를 작성해주세요.`,
            type: "TRADE",
            link: `/profile/my-purchases`,
            image: imageUrl,
          },
        }),
        ...badgeTasks,
        checkPortFestivalBadge(info.user.id),
        checkPortFestivalBadge(info.reservation_userId),
        checkBoardExplorerBadge(info.user.id),
        checkBoardExplorerBadge(info.reservation_userId),
      ]);

      await Promise.allSettled([
        supabase.channel(`user-${info.user.id}-notifications`).send({
          type: "broadcast",
          event: "notification",
          payload: {
            userId: info.user.id,
            title: sellerNotification.title,
            body: sellerNotification.body,
            link: sellerNotification.link,
            type: sellerNotification.type,
            image: sellerNotification.image,
          },
        }),
        supabase.channel(`user-${info.reservation_userId}-notifications`).send({
          type: "broadcast",
          event: "notification",
          payload: {
            userId: info.reservation_userId,
            title: buyerNotification.title,
            body: buyerNotification.body,
            link: buyerNotification.link,
            type: buyerNotification.type,
            image: buyerNotification.image,
          },
        }),
        sendPushNotification({
          targetUserId: info.user.id,
          title: sellerNotification.title,
          message: sellerNotification.body,
          url: sellerNotification.link || "",
          type: "TRADE",
          image: sellerNotification.image || undefined,
          tag: `bp-trade-${productId}`,
          renotify: true,
          topic: `bp-trade-${productId}`,
        }),
        sendPushNotification({
          targetUserId: info.reservation_userId,
          title: buyerNotification.title,
          message: buyerNotification.body,
          url: buyerNotification.link || "",
          type: "TRADE",
          image: buyerNotification.image || undefined,
          tag: `bp-trade-${productId}`,
          renotify: true,
          topic: `bp-trade-${productId}`,
        }),
      ]);

      // 캐시 무효화
      rvSellerTabsAndCounts(info.user.id);
      rvBuyerPurchasedAndCounts(info.reservation_userId);
      revalidateTag(`product-detail-id-${productId}`);

      // 프로필 리뷰/평점 캐시 무효화(양쪽)
      revalidateTag(`user-average-rating-id-${info.user.id}`);
      revalidateTag(`user-reviews-initial-id-${info.user.id}`);
      revalidateTag(`user-average-rating-id-${info.reservation_userId}`);
      revalidateTag(`user-reviews-initial-id-${info.reservation_userId}`);

      return { success: true, newStatus: "sold" as const };
    }

    /* -------- SELLING (예약중/판매완료 → 판매중) -------- */
    const prev2 = await db.product.findUnique({
      where: { id: productId },
      select: { userId: true, purchase_userId: true },
    });
    if (!prev2) return { success: false, error: "상품을 찾을 수 없습니다." };

    await db.product.update({
      where: { id: productId },
      data: {
        purchased_at: null,
        purchase_userId: null,
        reservation_at: null,
        reservation_userId: null,
      },
    });

    rvSellerTabsAndCounts(prev2.userId);
    if (prev2.purchase_userId) rvBuyerPurchasedAndCounts(prev2.purchase_userId);
    revalidateTag(`product-detail-id-${productId}`);

    // 리뷰 삭제는 클라이언트 Confirm 후 deleteAllProductReviews 호출로 처리
    return { success: true, newStatus: "selling" as const };
  } catch (err) {
    console.error("상품 상태 업데이트 중 오류:", err);
    return {
      success: false,
      error:
        err instanceof Error
          ? err.message
          : "상품 상태 업데이트에 실패했습니다.",
    };
  }
}
