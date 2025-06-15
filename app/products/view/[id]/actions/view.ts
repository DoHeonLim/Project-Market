/**
File Name : app/products/view/[id]/actions/view
Description : 제품 조회수 관련 서버 액션
Author : 임도헌

History
Date        Author   Status    Description
2024.12.12  임도헌   Created   조회수 업데이트 서버 코드 분리
2025.06.08  임도헌   Modified  actions 파일 역할별 분리
*/
"use server";

import db from "@/lib/db";
import { revalidateTag } from "next/cache";

/**
 * 제품 조회수 증가 함수
 */
const incrementProductViews = async (id: number): Promise<number | null> => {
  try {
    const result = await db.product.update({
      where: { id },
      data: {
        views: { increment: 1 },
      },
      select: { views: true },
    });

    revalidateTag(`product-views-${id}`);
    return result.views;
  } catch (error) {
    console.error("[incrementProductViews] 조회수 업데이트 실패:", error);
    return null;
  }
};

/**
 * 제품 조회수 증가 후 조회수 반환
 */
export const getCachedProductWithViews = async (id: number) => {
  return incrementProductViews(id);
};
