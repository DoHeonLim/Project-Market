/**
 * File Name : lib/product/delete/deleteProduct
 * Description : 제품 삭제
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2025.06.15  임도헌   Created
 * 2025.06.15  임도헌   Modified  제품 삭제 함수 분리
 * 2025.11.19  임도헌   Modified  해당 제품 상세, 프로필 탭/카운트 캐시 초기화 추가
 */
"use server";

import db from "@/lib/db";
import { revalidateTag } from "next/cache";

export async function deleteProduct(id: number) {
  // 삭제 전 소유자/상태 조회
  const prod = await db.product.findUnique({
    where: { id },
    select: {
      userId: true,
      purchase_userId: true,
      reservation_userId: true,
    },
  });
  if (!prod) {
    return;
  }

  await db.product.delete({ where: { id } });

  // 상세 페이지 및 프로필 탭/카운트 캐시 무효화
  revalidateTag(`product-detail-id-${id}`);
  revalidateTag(`user-products-SELLING-id-${prod.userId}`);
  revalidateTag(`user-products-RESERVED-id-${prod.userId}`);
  revalidateTag(`user-products-SOLD-id-${prod.userId}`);
  revalidateTag(`user-products-counts-id-${prod.userId}`);

  if (prod.purchase_userId) {
    revalidateTag(`user-products-PURCHASED-id-${prod.purchase_userId}`);
    revalidateTag(`user-products-counts-id-${prod.purchase_userId}`);
  }
}
