/**
 File Name : app/(tabs)/products/actions/init
 Description : 초기 제품 로딩, 무한 스크롤
 Author : 임도헌
 
 History
 Date        Author   Status    Description
 2025.05.29  임도헌   Created
 2025.05.29  임도헌   Modified  app/(tabs)/products/actions.ts 파일을 기능별로 분리
 2025.05.29  임도헌   Modified  초기 제품 로딩 기능 분리
 2025.05.29  임도헌   Modified  무한 스크롤 기능 분리
 */
"use server";

import db from "@/lib/db";
import { PRODUCT_SELECT } from "@/lib/constants/productSelect";

const TAKE = 10;

// 초기 제품 10개 가져오기
export const getInitialProducts = async () => {
  return db.product.findMany({
    select: PRODUCT_SELECT,
    orderBy: { created_at: "desc" },
    take: TAKE,
  });
};

// 초기 제품 이후 10개씩 더 가져오기
export const getMoreProducts = async (page: number) => {
  const skip = page * TAKE;
  return db.product.findMany({
    select: PRODUCT_SELECT,
    orderBy: { created_at: "desc" },
    take: TAKE,
    skip,
  });
};
