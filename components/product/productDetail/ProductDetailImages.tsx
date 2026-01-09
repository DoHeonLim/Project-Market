/**
File Name : components/productDetail/ProductDetailImages
Description : 제품 상세 이미지 및 조회수 표시 컴포넌트
Author : 임도헌

History
Date        Author   Status    Description
2025.06.08  임도헌   Created   제품 상세 이미지 영역 분리 및 컴포넌트화
*/

"use client";

import Carousel from "@/components/common/Carousel";
import { EyeIcon } from "@heroicons/react/24/solid";

interface ProductDetailImagesProps {
  images: { url: string; order?: number }[];
  views: number | null;
}

export default function ProductDetailImages({
  images,
  views,
}: ProductDetailImagesProps) {
  return (
    <div className="w-full h-[300px] relative">
      <Carousel images={images} className="w-full h-full" />
      <div className="absolute top-4 right-4 flex items-center gap-1 px-2 py-1 bg-black/50 rounded-full text-white text-sm">
        <EyeIcon className="size-4" />
        <span>{views}</span>
      </div>
    </div>
  );
}
