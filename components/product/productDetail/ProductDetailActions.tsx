/**
File Name : components/productDetail/ProductDetailActions
Description : 제품 상세 좋아요 및 채팅 버튼 컴포넌트
Author : 임도헌

History
Date        Author   Status    Description
2025.06.08  임도헌   Created   좋아요 및 채팅 인터랙션 컴포넌트 분리
*/

"use client";

import Link from "next/link";
import ProductLikeButton from "@/components/product/ProductLikeButton";
import ChatButton from "@/components/chat/ChatButton";

interface ProductDetailActionsProps {
  productId: number;
  isLiked: boolean;
  likeCount: number;
  isOwner: boolean;
}

export default function ProductDetailActions({
  productId,
  isLiked,
  likeCount,
  isOwner,
}: ProductDetailActionsProps) {
  return (
    <div className="flex justify-between items-center pt-6">
      <ProductLikeButton
        productId={productId}
        isLiked={isLiked}
        likeCount={likeCount}
      />
      <div className="flex gap-3">
        {isOwner ? (
          <Link
            href={`/products/view/${productId}/edit`}
            className="px-4 py-2 rounded-md text-white font-medium bg-primary hover:bg-primary/90 transition-colors text-sm flex items-center gap-2"
          >
            ⚙️ 수정하기
          </Link>
        ) : (
          <ChatButton productId={productId} />
        )}
      </div>
    </div>
  );
}
