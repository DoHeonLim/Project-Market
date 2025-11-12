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

/* ---------------- Revalidate Functions ---------------- */

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
    // 권한 체크: 제품 소유자만 변경 가능
    const session = await getSession();
    if (!session?.id) {
      return { success: false, error: "로그인이 필요합니다." };
    }
    const owner = await db.product.findUnique({
      where: { id: productId },
      select: { userId: true },
    });
    if (!owner || owner.userId !== session.id) {
      return { success: false, error: "권한이 없습니다." };
    }

    /* -------- RESERVED (판매중 → 예약중) --------
       규칙: 판매자 태그만 무효화 */
    if (status === "reserved") {
      if (!selectUserId) {
        throw new Error("예약 전환에는 selectUserId가 필요합니다.");
      }

      // 선택 유저가 실제 채팅 상대인지 검증
      const validChatUser = await db.productChatRoom.findFirst({
        where: {
          productId,
          users: { some: { id: session.id } }, // 내가 속한 방
          AND: [{ users: { some: { id: selectUserId } } }],
        },
        select: { id: true },
      });
      if (!validChatUser) {
        throw new Error("채팅 내역이 없는 유저는 예약자로 지정할 수 없습니다.");
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
          link: `/products/view/${productId}`, // 통일
          image: imageUrl,
        },
      });

      await Promise.all([
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
          image: notification.image || "",
          // 동일 상품 알림은 하나로 교체
          tag: `bp-trade-${productId}`,
          // 예약 전환은 인지 필요 → 소리/진동 허용
          renotify: true,
          topic: `bp-trade-${productId}`,
        }),
      ]);

      // 캐시 무효화 (판매자만)
      rvSellerTabsAndCounts(product.user.id);
      revalidateTag(`product-detail-id-${productId}`);

      return { success: true, newStatus: "reserved" as const };
    }

    /* -------- SOLD (예약중 → 판매완료) --------
       규칙: 판매자 + 구매자(PURCHASED) 태그 모두 무효화 */
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
        throw new Error(
          "구매자(예약자)가 지정되지 않아 판매완료로 전환할 수 없습니다."
        );
      }

      await db.product.update({
        where: { id: productId },
        data: {
          purchased_at: new Date(),
          purchase_userId: info.reservation_userId,
        },
      });

      // 배지 체크 (원본 로직 유지)
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

      const badgeSet = new Set(info.user.badges.map((b) => b.name));
      const sellerHasBadge =
        badgeSet.has("POWER_SELLER") ||
        badgeSet.has("FAIR_TRADER") ||
        badgeSet.has("GENRE_MASTER");

      if (!sellerHasBadge && sellerTradeCount >= 14) {
        badgeTasks.push(checkGenreMasterBadge(info.user.id));
        badgeTasks.push(checkGenreMasterBadge(info.reservation_userId));
      } else if (!sellerHasBadge && sellerTradeCount >= 9) {
        badgeTasks.push(checkPowerSellerBadge(info.user.id));
      } else if (!sellerHasBadge && sellerTradeCount >= 4) {
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

      await Promise.all([
        // 유저 전용 채널 브로드캐스트(판매자)
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
        // 유저 전용 채널 브로드캐스트(구매자)
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
        // 푸시(판매자/구매자)
        sendPushNotification({
          targetUserId: info.user.id,
          title: sellerNotification.title,
          message: sellerNotification.body,
          url: sellerNotification.link || "",
          type: "TRADE",
          image: sellerNotification.image || "",
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
          image: buyerNotification.image || "",
          tag: `bp-trade-${productId}`,
          renotify: true,
          topic: `bp-trade-${productId}`,
        }),
      ]);

      // 캐시 무효화 (판매자 + 구매자)
      rvSellerTabsAndCounts(info.user.id);
      rvBuyerPurchasedAndCounts(info.reservation_userId);
      revalidateTag(`product-detail-id-${productId}`);

      return { success: true, newStatus: "sold" as const };
    }

    /* -------- SELLING (예약중/판매완료 → 판매중) --------
       규칙:
       - RESERVED → SELLING : 판매자만
       - SOLD → SELLING(롤백) : 판매자 + 구매자(PURCHASED)
    */
    const prev = await db.product.findUnique({
      where: { id: productId },
      select: { userId: true, purchase_userId: true },
    });
    if (!prev) {
      return { success: false, error: "상품을 찾을 수 없습니다." };
    }

    await db.product.update({
      where: { id: productId },
      data: {
        purchased_at: null,
        purchase_userId: null, // 있었으면 SOLD → SELLING 롤백
        reservation_at: null,
        reservation_userId: null, // 있었으면 RESERVED → SELLING
      },
    });

    // 판매자 탭/카운트 무효화는 공통
    rvSellerTabsAndCounts(prev.userId);

    // SOLD → SELLING 롤백이었다면 구매자 캐시도 무효화
    if (prev.purchase_userId) {
      rvBuyerPurchasedAndCounts(prev.purchase_userId);
    }

    revalidateTag(`product-detail-id-${productId}`);
    return { success: true, newStatus: "selling" as const };
  } catch (error) {
    console.error("상품 상태 업데이트 중 오류:", error);
    return { success: false, error: "상품 상태 업데이트에 실패했습니다." };
  }
}
