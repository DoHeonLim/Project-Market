/**
File Name : components/productDetail/ProductDetailContainer
Description : 제품 상세 좋아요 및 채팅 버튼 컴포넌트
Author : 임도헌

History
Date        Author   Status    Description
2025.06.08  임도헌   Created   제품 상세 컴포넌트
*/
"use client";

import { ProductDetailType } from "@/types/product";
import ProductDetailImages from "./ProductDetailImages";
import ProductDetailMeta from "./ProductDetailMeta";
import ProductDetailHeader from "./ProductDetailHeader";
import ProductDetailInfoGrid from "./ProductDetailInfoGrid";
import ProductDetailTags from "./ProductDetailTags";
import ProductDetailActions from "./ProductDetailActions";

interface ProductDetailProps {
  product: ProductDetailType;
  views: number | null;
  isOwner: boolean;
  likeCount: number;
  isLiked: boolean;
}

export default function ProductDetailContainer({
  product,
  views,
  isOwner,
  likeCount,
  isLiked,
}: ProductDetailProps) {
  return (
    <div className="min-h-screen bg-white dark:bg-neutral-900 pb-10">
      <div className="mb-24 mx-auto overflow-hidden">
        <ProductDetailImages images={product.images} views={views} />
        <ProductDetailMeta
          username={product.user.username}
          avatar={product.user.avatar}
          created_at={product.created_at.toString()}
        />
        <div className="p-4 space-y-4">
          <ProductDetailHeader
            title={product.title}
            price={product.price}
            game_type={product.game_type}
          />
          <ProductDetailInfoGrid
            category={product.category}
            min_players={product.min_players}
            max_players={product.max_players}
            play_time={product.play_time}
            condition={product.condition}
            completeness={product.completeness}
            has_manual={product.has_manual}
          />
          <ProductDetailTags tags={product.search_tags} />
          <ProductDetailActions
            productId={product.id}
            isLiked={isLiked}
            likeCount={likeCount}
            isOwner={isOwner}
          />
        </div>
      </div>
    </div>
  );
}
