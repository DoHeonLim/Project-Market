/**
File Name : app/(tabs)/profile/(product)/my-sales/actions
Description : 프로필 나의 판매 제품 서버 코드
Author : 임도헌

History
Date        Author   Status    Description
2024.11.30  임도헌   Created
2024.11.30  임도헌   Modified  프로필 나의 판매 제품 서버 코드 추가
2024.12.02  임도헌   Modified  revalidateTag로 캐싱 기능 추가
2024.12.03  임도헌   Modified  purchase_at을 purchased_at으로 변경
2024.12.04  임도헌   Modified  예약 유저 정보 추가
2024.12.12  임도헌   Modified  제품 대표 사진 하나 들고오기
2024.12.21  임도헌   Modified  푸시 알림 기능 추가
2024.12.30  임도헌   Modified  뱃지(First Deal) 체크 기능 추가
2025.01.12  임도헌   Modified  푸시 알림 이미지 링크 변경
*/
"use server";

import db from "@/lib/db";
import getSession from "@/lib/session";
import { revalidateTag } from "next/cache";
import { supabase } from "@/lib/supabase";
import { sendPushNotification } from "@/lib/push-notification";
import { checkFirstDealBadge } from "@/lib/check-badge-conditions";

export const getSellingProducts = async (userId: number) => {
  const SellingProduct = await db.product.findMany({
    where: {
      userId,
    },
    select: {
      id: true,
      title: true,
      price: true,
      images: {
        select: {
          url: true,
        },
        orderBy: {
          order: "asc",
        },
        take: 1,
      },
      created_at: true,
      updated_at: true,
      reservation_userId: true,
      reservation_at: true,
      purchased_at: true,
      purchase_userId: true,
      user: {
        select: {
          username: true,
          avatar: true,
        },
      },
      reviews: true,
    },
  });
  return SellingProduct;
};

// 이 제품에 대해 채팅한 유저들 목록
export const getProductChatUsers = async (productId: number) => {
  const session = await getSession();
  const users = await db.productChatRoom.findMany({
    where: {
      // 제품에 해당하고 현재 유저가 포함된 채팅방을 찾는다.
      productId,
      users: {
        some: {
          id: {
            in: [session.id!],
          },
        },
      },
    },
    select: {
      users: {
        where: {
          NOT: {
            id: session.id!,
          },
        },
        select: {
          id: true,
          username: true,
          avatar: true,
        },
      },
    },
  });
  return users.flatMap((chatRoom) => chatRoom.users);
};

// 제품의 현재 상태 업데이트
export const updateProductStatus = async (
  productId: number,
  status: "selling" | "reserved" | "sold",
  selectUserId?: number
) => {
  try {
    let product;
    // 예약중으로 변경한 경우
    if (status === "reserved") {
      try {
        product = await db.product.update({
          where: {
            id: productId,
          },
          data: {
            reservation_at: new Date(),
            reservation_userId: selectUserId,
            purchased_at: null,
            purchase_userId: null,
          },
          include: {
            user: {
              select: {
                id: true,
                username: true,
              },
            },
            images: {
              take: 1,
              select: {
                url: true,
              },
            },
          },
        });

        if (selectUserId) {
          const notification = await db.notification.create({
            data: {
              userId: selectUserId,
              title: "상품이 예약되었습니다",
              body: `${product.title} 상품이 예약되었습니다.`,
              type: "TRADE",
              link: `/products/${productId}`,
              image: `${product.images[0]?.url}/public`,
            },
          });

          // 모든 알림 관련 작업을 Promise.all로 한번에 처리
          await Promise.all([
            supabase.channel("notifications").send({
              type: "broadcast",
              event: "notification",
              payload: notification,
            }),
            sendPushNotification({
              targetUserId: selectUserId,
              title: notification.title,
              message: notification.body,
              url: notification.link || "",
              type: "TRADE",
              image: `${notification.image}/public` || "",
            }),
          ]);
        }
      } catch (error) {
        console.error("예약 처리 중 오류:", error);
        throw error;
      }
    }
    // 판매 완료로 변경한 경우
    else if (status === "sold") {
      // 예약중인 유저의 아이디 들고온다.
      const reservationInfo = await db.product.findUnique({
        where: {
          id: productId,
        },
        select: {
          reservation_userId: true,
          title: true,
          user: {
            select: {
              id: true,
              username: true,
            },
          },
          images: {
            take: 1,
            select: {
              url: true,
            },
          },
        },
      });
      // 예약 중인 유저의 아이디가 있을 시 판매된 시간과 예약 중인 유저를 판매한 유저 아이디로 넣는다.
      if (reservationInfo?.reservation_userId) {
        product = await db.product.update({
          where: {
            id: productId,
          },
          data: {
            purchased_at: new Date(),
            purchase_userId: reservationInfo.reservation_userId,
          },
        });

        // 판매자와 구매자 모두 첫 거래 뱃지 체크
        await Promise.all([
          checkFirstDealBadge(reservationInfo.user.id),
          checkFirstDealBadge(reservationInfo.reservation_userId),
        ]);

        // 판매 완료 알림 생성
        const [sellerNotification, buyerNotification] = await Promise.all([
          // 판매자에게 알림
          db.notification.create({
            data: {
              userId: reservationInfo.user.id,
              title: "상품이 판매되었습니다",
              body: `${reservationInfo.title} 상품이 판매되었습니다.`,
              type: "TRADE",
              link: `/products/${productId}`,
              image: `${reservationInfo.images[0]?.url}/public`,
            },
          }),
          // 구매자에게 알림
          db.notification.create({
            data: {
              userId: reservationInfo.reservation_userId,
              title: "상품 구매가 완료되었습니다",
              body: `${reservationInfo.title} 상품의 구매가 완료되었습니다. 리뷰를 작성해주세요.`,
              type: "TRADE",
              link: `/profile/my-purchases`,
              image: `${reservationInfo.images[0]?.url}/public`,
            },
          }),
        ]);

        // 실시간 알림 전송
        await Promise.all([
          supabase.channel("notifications").send({
            type: "broadcast",
            event: "notification",
            payload: sellerNotification,
          }),
          supabase.channel("notifications").send({
            type: "broadcast",
            event: "notification",
            payload: buyerNotification,
          }),
          sendPushNotification({
            targetUserId: reservationInfo.user.id,
            title: sellerNotification.title,
            message: sellerNotification.body,
            url: sellerNotification.link || "",
            type: "TRADE",
            image: sellerNotification.image || "",
          }),
          sendPushNotification({
            targetUserId: reservationInfo.reservation_userId,
            title: buyerNotification.title,
            message: buyerNotification.body,
            url: buyerNotification.link || "",
            type: "TRADE",
            image: buyerNotification.image || "",
          }),
        ]);
      }
    }
    // 판매 중으로 변경한 경우
    else if (status === "selling") {
      product = await db.product.update({
        where: {
          id: productId,
        },
        data: {
          purchased_at: null,
          purchase_userId: null,
          reservation_at: null,
          reservation_userId: null,
        },
      });
    }

    revalidateTag("selling-product-list");
    revalidateTag("product-detail");
    return { success: true };
  } catch (error) {
    console.error("상품 상태 업데이트 중 오류:", error);
    return { success: false, error: "상품 상태 업데이트에 실패했습니다." };
  }
};

// 제품의 모든 리뷰 삭제
export const deleteAllProductReviews = async (productId: number) => {
  try {
    await db.review.deleteMany({
      where: {
        productId: productId,
      },
    });
    revalidateTag("selling-product-list");
  } catch (error) {
    console.error("리뷰 삭제 중 오류:", error);
    throw new Error("리뷰를 삭제하는 중 오류가 발생했습니다.");
  }
};

export const getUserInfo = async (userId: number) => {
  const user = await db.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      username: true,
      avatar: true,
    },
  });
  return user;
};
