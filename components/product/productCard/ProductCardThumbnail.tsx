/**
 * File Name : components/product/ProductCardThumbnail
 * Description : 제품 카드 썸네일 컴포넌트 (리스트/그리드 공통 사용)
 * Author : 임도헌
 * History
 * Date        Author   Status    Description
 * 2025.06.07  임도헌   Created   제품 썸네일 전용 컴포넌트 분리
 */

import Image from "next/image";

interface ProductCardThumbnailProps {
  imageUrl: string;
  viewMode: "grid" | "list";
  title: string;
  isPriority?: boolean;
  reservation_userId: number | null;
  purchase_userId: number | null;
}

export default function ProductCardThumbnail({
  imageUrl,
  viewMode,
  title,
  isPriority,
  reservation_userId,
  purchase_userId,
}: ProductCardThumbnailProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-lg ${
        viewMode === "grid" ? "aspect-square w-full" : "size-28 flex-shrink-0"
      } group-hover:shadow-lg transition-shadow`}
    >
      <Image
        fill
        src={`${imageUrl}/public`}
        priority={isPriority}
        sizes={
          viewMode === "grid"
            ? "(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            : "112px"
        }
        className="object-cover transform group-hover:scale-105 transition-transform duration-300"
        alt={title}
      />
      {(reservation_userId || purchase_userId) && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
          <span className="text-white font-bold text-sm sm:text-base">
            {purchase_userId ? "⚓ 판매완료" : "🛞 예약중"}
          </span>
        </div>
      )}
    </div>
  );
}
