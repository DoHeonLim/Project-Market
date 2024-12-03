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
*/
"use server";

import db from "@/lib/db";
import getSession from "@/lib/session";
import { revalidateTag } from "next/cache";

export const getSellingProducts = async (userId: number) => {
  const SellingProduct = await db.product.findMany({
    where: {
      userId,
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
    // 예약중으로 변경한 경우
    if (status === "reserved") {
      await db.product.update({
        where: {
          id: productId,
        },
        data: {
          reservation_at: new Date(),
          reservation_userId: selectUserId,
          purchased_at: null,
          purchase_userId: null,
        },
      });
    }
    // 판매 완료로 변경한 경우
    else if (status === "sold") {
      // 예약중인 유저의 아이디 들고온다.
      const reservationInfo = await db.product.findUnique({
        where: {
          id: productId,
        },
        select: { reservation_userId: true },
      });
      // 예약 중인 유저의 아이디가 있을 시 판매된 시간과 예약 중인 유저를 판매한 유저 아이디로 넣는다.
      if (reservationInfo) {
        await db.product.update({
          where: {
            id: productId,
          },
          data: {
            purchased_at: new Date(),
            purchase_userId: reservationInfo.reservation_userId,
          },
        });
      }
    }
    // 판매 중으로 변경한 경우
    else if (status === "selling") {
      await db.product.update({
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
  } catch (error) {
    console.error("상품 상태 업데이트 중 오류:", error);
  }
};
