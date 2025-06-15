/**
 * File Name : lib/product/delete/deleteProduct
 * Description : 제품 삭제
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2025.06.15  임도헌   Created
 * 2025.06.15  임도헌   Modified  제품 삭제 함수 분리
 */
"use server";

import db from "@/lib/db";

export async function deleteProduct(id: number) {
  await db.product.delete({ where: { id } });
}
