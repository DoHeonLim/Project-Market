/**
File Name : app/products/view/[id]/actions/product
Description : 제품 정보 조회 관련 서버 액션
Author : 임도헌

History
Date        Author   Status    Description
2024.12.12  임도헌   Created   제품 상세 정보 관련 서버 코드 분리
2025.06.08  임도헌   Modified  actions 파일 역할별 분리 시작
*/
"use server";

import db from "@/lib/db";
import getSession from "@/lib/session";
import { ProductDetailType } from "@/types/product";
import { unstable_cache as nextCache } from "next/cache";

/**
 * 제품 상세 정보를 가져오는 함수
 * @param id 제품 ID
 * @returns 제품 상세 정보 또는 null
 */
export const getProduct = async (
  id: number
): Promise<ProductDetailType | null> => {
  try {
    const product = await db.product.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, username: true, avatar: true } },
        images: {
          orderBy: { order: "asc" },
          select: { url: true, order: true },
        },
        category: {
          select: {
            eng_name: true,
            kor_name: true,
            icon: true,
            parent: {
              select: {
                eng_name: true,
                kor_name: true,
                icon: true,
              },
            },
          },
        },
        search_tags: { select: { name: true } },
        _count: { select: { product_likes: true } },
      },
    });

    if (!product) return null;

    return product as ProductDetailType; // 👈 여기서 명시적으로 타입 단언
  } catch (e) {
    console.error("[getProduct] 제품 정보 조회 실패:", e);
    return null;
  }
};

/**
 * 제품 상세 정보 캐싱 함수
 */
export const getCachedProduct = (id: number) => {
  return nextCache(() => getProduct(id), [`product-detail-${id}`], {
    tags: ["product-detail", `product-views-${id}`],
  })();
};

// /**
//  * 제품 제목을 가져오는 함수 (메타데이터용)
//  */
// export const getProductTitle = async (id: number) => {
//   const product = await db.product.findUnique({
//     where: { id },
//     select: { title: true },
//   });
//   return product;
// };

// /**
//  * 제품 제목 캐싱 함수
//  */
// export const getCachedProductTitle = (id: number) => {
//   return nextCache(() => getProductTitle(id), [`product-title-${id}`], {
//     tags: ["product-title"],
//   })();
// };

/**
 * 제품 소유자 체크 함수
 * @param userId 유저 ID
 * @returns 소유자 여부
 */
export const getIsOwner = async (userId: number) => {
  const session = await getSession();
  if (session.id) {
    return session.id === userId;
  }
  return false;
};
