/**
File Name : components/product/ProductCard/partials/ProductCardPrice
Description : 제품 가격 및 판매 상태 뱃지 컴포넌트
Author : 임도헌

History
Date        Author   Status    Description
2025.06.07  임도헌   Created   제품 카드 가격/상태 파트 분리
*/

import { formatToWon } from "@/lib/utils";

interface ProductCardPriceProps {
  price: number;
  purchase_userId: number | null;
  reservation_userId: number | null;
}

export default function ProductCardPrice({
  price,
  purchase_userId,
  reservation_userId,
}: ProductCardPriceProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-base sm:text-lg font-bold text-accent dark:text-accent-light">
        💰 {formatToWon(price)}원
      </span>
      {purchase_userId && (
        <span className="px-2 py-0.5 text-xs sm:text-sm font-medium bg-neutral-500 text-white rounded-full">
          ⚓ 판매완료
        </span>
      )}
      {reservation_userId && !purchase_userId && (
        <span className="px-2 py-0.5 text-xs sm:text-sm font-medium bg-green-500 text-white rounded-full">
          🛞 예약중
        </span>
      )}
    </div>
  );
}
