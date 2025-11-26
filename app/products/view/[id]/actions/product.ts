/**
File Name : app/products/view/[id]/actions/product
Description : 제품 정보 조회 관련 서버 액션
Author : 임도헌

History
Date        Author   Status    Description
2024.12.12  임도헌   Created   제품 상세 정보 관련 서버 코드 분리
2025.06.08  임도헌   Modified  actions 파일 역할별 분리 시작
2025.07.06  임도헌   Modified  getIsOwner 함수 lib로 이동
*/
"use server";

import db from "@/lib/db";
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

    return product as ProductDetailType; // 여기서 명시적으로 타입 단언
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
    tags: [`product-detail-id-${id}`, `product-views-${id}`],
  })();
};
