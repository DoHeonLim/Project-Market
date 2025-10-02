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
 2025.09.02  임도헌   Modified  TAKE 상수 PRODUCTS_PAGE_TAKE로 변경
 */

"use server";

import db from "@/lib/db";
import { PRODUCT_SELECT } from "@/lib/constants/productSelect";
import { ProductType, Products } from "@/types/product";
import { PRODUCTS_PAGE_TAKE } from "@/lib/constants";

const TAKE = PRODUCTS_PAGE_TAKE;

/**
 * 초기 제품 10개 가져오기
 */
export const getInitialProducts = async (): Promise<Products> => {
  const products: ProductType[] = (await db.product.findMany({
    select: PRODUCT_SELECT,
    orderBy: { created_at: "desc" },
    take: TAKE,
  })) as ProductType[];

  return {
    products,
    nextCursor: null,
  };
};

/**
 * 무한 스크롤: 다음 10개 제품 가져오기
 * @param cursor 마지막으로 가져온 제품의 ID
 */
export const getMoreProducts = async (
  cursor: number | null
): Promise<Products> => {
  const products: ProductType[] = (await db.product.findMany({
    select: PRODUCT_SELECT,
    orderBy: { created_at: "desc" },
    take: TAKE + 1,
    ...(cursor && {
      skip: 1,
      cursor: { id: cursor },
    }),
  })) as ProductType[];

  const hasNextPage = products.length > TAKE;
  const paginatedProducts = hasNextPage ? products.slice(0, TAKE) : products;
  const nextCursor = hasNextPage
    ? paginatedProducts[paginatedProducts.length - 1].id
    : null;

  return {
    products: paginatedProducts,
    nextCursor,
  };
};
