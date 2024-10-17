/**
 File Name : app/(tabs)/products/loading
 Description : 제품 무한 스크롤
 Author : 임도헌
 
 History
 Date        Author   Status    Description
 2024.10.17  임도헌   Created
 2024.10.17  임도헌   Modified  무한 스크롤 기능 추가
 */
"use server";

import db from "@/lib/db";

export const getMoreProducts = async (page: number) => {
  const products = await db.product.findMany({
    select: {
      title: true,
      price: true,
      created_at: true,
      photo: true,
      id: true,
    },
    skip: page * 1,
    take: 1,
    orderBy: {
      created_at: "desc",
    },
  });
  return products;
};
