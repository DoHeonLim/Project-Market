/**
File Name : app/(tabs)/profile/(product)/my-purchases/actions
Description : 프로필 나의 구매 제품 서버 코드
Author : 임도헌

History
Date        Author   Status    Description
2024.12.02  임도헌   Created
2024.12.02  임도헌   Modified  내가 구매한 제품 내역 추가
2024.12.03  임도헌   Modified  리뷰 생성, 삭제 추가
2024.12.03  임도헌   Modified  revalidateTag로 캐싱 기능 추가
*/
"use server";

import db from "@/lib/db";
import { revalidateTag } from "next/cache";

// 내가 구매한 제품 내역
export const getPurchasedProducts = async (userId: number) => {
  const purchasedProducts = await db.product.findMany({
    where: {
      purchase_userId: userId,
    },
    select: {
      id: true,
      title: true,
      price: true,
      photo: true,
      purchase_userId: true,
      purchased_at: true,
      user: {
        select: {
          username: true,
          avatar: true,
        },
      },
      reviews: true,
    },
  });
  return purchasedProducts;
};

// 제품에 대한 유저의 리뷰 생성
// 구매자가 판매자에게 리뷰 전송
// id, userId, productId, payload, rate 5개 넣어야됨
export const buyerCreateReview = async (
  userId: number,
  productId: number,
  payload: string,
  rate: number
) => {
  await db.review.create({
    data: {
      userId,
      productId,
      payload,
      rate,
    },
    select: {
      id: true,
    },
  });
  revalidateTag("purchased-product-list");
};

// 리뷰 삭제
export const deleteReview = async (
  reviewId: number,
  who: "buyer" | "seller"
) => {
  try {
    await db.review.delete({
      where: {
        id: reviewId,
      },
    });
    if (who === "buyer") {
      revalidateTag("purchased-product-list");
    } else {
      revalidateTag("selling-product-list");
    }
    return { success: true };
  } catch (error) {
    console.error("리뷰 삭제 중 오류 발생:", error);
    throw new Error("리뷰를 삭제하는 중 오류가 발생했습니다.");
  }
};
