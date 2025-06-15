/**
File Name : components/productDetail/modal/ProductDetailModalContainer.tsx
Description : 제품 상세 페이지 모달 컨테이너
Author : 임도헌

History
Date        Author   Status    Description
2025.06.08  임도헌   Created   모달 스타일을 적용한 제품 상세 컨테이너 래퍼
2025.06.08  임도헌   Modified  어두운 배경과 중앙 정렬 레이아웃 추가
*/
"use client";

import { useEffect } from "react";
import ProductDetailContainer from "..";
import type { ProductDetailType } from "@/types/product";
import CloseButton from "@/components/common/CloseButton";
import { useRouter } from "next/navigation";

interface ProductDetailProps {
  product: ProductDetailType;
  views: number | null;
  isOwner: boolean;
  likeCount: number;
  isLiked: boolean;
}

export default function ProductDetailModalContainer(props: ProductDetailProps) {
  const router = useRouter();

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  const handleClose = () => {
    router.push("/products");
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-screen-sm bg-white dark:bg-neutral-900 rounded-lg shadow-xl max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()} // 내부 클릭 시 모달 닫힘 방지
      >
        <div className="flex justify-end p-2">
          <CloseButton href={"products"} />
        </div>
        <div className="flex-1 overflow-y-auto">
          <ProductDetailContainer {...props} />
        </div>
      </div>
    </div>
  );
}
