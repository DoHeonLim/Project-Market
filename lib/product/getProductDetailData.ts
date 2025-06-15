/**
 * File Name : lib/product/getProductDetailData
 * Description : 제품 상세 데이터 반환
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2025.06.07  임도헌   Created
 */

import { getCachedProductLikeStatus } from "@/app/products/view/[id]/actions/like";
import {
  getCachedProduct,
  getIsOwner,
} from "@/app/products/view/[id]/actions/product";
import { getCachedProductWithViews } from "@/app/products/view/[id]/actions/view";
import { ProductDetailType } from "@/types/product";

export interface ProductDetailData {
  product: ProductDetailType;
  views: number;
  isOwner: boolean;
  likeCount: number;
  isLiked: boolean;
}

export async function getProductDetailData(
  id: number
): Promise<ProductDetailData | null> {
  if (isNaN(id)) return null;

  const product = await getCachedProduct(id);
  if (!product) return null;

  const [views, isOwner, likeStatus] = await Promise.all([
    getCachedProductWithViews(id),
    getIsOwner(product.user.id),
    getCachedProductLikeStatus(product.id),
  ]);

  return {
    product,
    views: views ?? 0,
    isOwner,
    likeCount: likeStatus.likeCount,
    isLiked: likeStatus.isLiked,
  };
}
