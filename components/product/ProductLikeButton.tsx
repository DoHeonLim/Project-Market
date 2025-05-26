/**
File Name : components/product/ProductLikeButton
Description : 제품 좋아요 버튼 컴포넌트
Author : 임도헌

History
Date        Author   Status    Description
2024.12.11  임도헌   Created
2024.12.11  임도헌   Modified  제품 좋아요 버튼 컴포넌트 추가
*/
"use client";

import { HeartIcon } from "@heroicons/react/24/solid";
import { HeartIcon as OutlineHeartIcon } from "@heroicons/react/24/outline";
import { useOptimistic } from "react";
import { dislikeProduct, likeProduct } from "@/app/products/[id]/actions";

interface IProductLikeButtonProps {
  isLiked: boolean;
  likeCount: number;
  productId: number;
}

export default function ProductLikeButton({
  isLiked,
  likeCount,
  productId,
}: IProductLikeButtonProps) {
  const [state, reducerFn] = useOptimistic(
    { isLiked, likeCount },
    (previousState) => ({
      isLiked: !previousState.isLiked,
      likeCount: previousState.isLiked
        ? previousState.likeCount - 1
        : previousState.likeCount + 1,
    })
  );

  const handleClick = async () => {
    reducerFn(undefined);
    if (isLiked) {
      await dislikeProduct(productId);
    } else {
      await likeProduct(productId);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`flex items-center gap-1 p-2 transition-colors
        ${
          state.isLiked
            ? "text-rose-500"
            : "text-neutral-400 hover:text-rose-500"
        }`}
    >
      {state.isLiked ? (
        <HeartIcon aria-label="heart" className="size-10" />
      ) : (
        <OutlineHeartIcon aria-label="heart_outline" className="size-10" />
      )}
      <span>{state.likeCount}</span>
    </button>
  );
}
