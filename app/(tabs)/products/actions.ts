/**
 File Name : app/(tabs)/products/loading
 Description : 제품 무한 스크롤
 Author : 임도헌
 
 History
 Date        Author   Status    Description
 2024.10.17  임도헌   Created
 2024.10.17  임도헌   Modified  무한 스크롤 기능 추가
 2024.12.05  임도헌   Modified  무한스크롤 10개씩 들고오게 수정
 2024.12.12  임도헌   Modified  제품 대표 사진 하나 들고오기
 */
"use server";

import db from "@/lib/db";

// 제품 초기화
export const getInitialProducts = async () => {
  const take = 10;
  const products = await db.product.findMany({
    select: {
      title: true,
      price: true,
      created_at: true,
      images: {
        where: { order: 0 },
        take: 1,
        select: {
          url: true,
        },
      },
      id: true,
      reservation_userId: true,
      purchase_userId: true,
    },
    orderBy: {
      created_at: "desc",
    },
    take,
  });
  return products;
};

export const getMoreProducts = async (page: number) => {
  const take = 10;
  const skip = page * take;

  const products = await db.product.findMany({
    select: {
      title: true,
      price: true,
      created_at: true,
      images: {
        where: { order: 0 },
        take: 1,
        select: {
          url: true,
        },
      },
      id: true,
      reservation_userId: true,
      purchase_userId: true,
    },
    skip,
    take,
    orderBy: {
      created_at: "desc",
    },
  });
  return products;
};
