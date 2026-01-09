/**
File Name : components/product/ProductLikeButton
Description : 제품 좋아요 버튼 컴포넌트
Author : 임도헌

History
Date        Author   Status    Description
2024.12.11  임도헌   Created
2024.12.11  임도헌   Modified  제품 좋아요 버튼 컴포넌트 추가
2025.06.08  임도헌   Modified  서버 데이터 props 기반으로 분리
2026.01.08  임도헌   Modified  useOptimistic 적용하여 반응성 개선 (PostLikeButton과 UX 통일)
*/
"use client";

import { useOptimistic, useTransition } from "react";
import {
  dislikeProduct,
  likeProduct,
} from "@/app/products/view/[id]/actions/like";
import { HeartIcon as OutlineHeartIcon } from "@heroicons/react/24/outline";
import { HeartIcon } from "@heroicons/react/24/solid";
import { toast } from "sonner";

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
  // 낙관적 상태 관리: 클릭 즉시 UI 반영
  const [optimisticState, setOptimisticState] = useOptimistic(
    { isLiked, likeCount },
    (state, newIsLiked: boolean) => ({
      isLiked: newIsLiked,
      likeCount: newIsLiked ? state.likeCount + 1 : state.likeCount - 1,
    })
  );

  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    const nextIsLiked = !optimisticState.isLiked;

    startTransition(async () => {
      // 1. 낙관적 업데이트 트리거
      setOptimisticState(nextIsLiked);

      try {
        // 2. 서버 액션 호출
        if (nextIsLiked) {
          await likeProduct(productId);
        } else {
          await dislikeProduct(productId);
        }
      } catch (error) {
        // 3. 실패 시 에러 메시지 (UI는 transition 종료 시 props 기준으로 자동 롤백됨)
        console.error(error);
        toast.error("좋아요 처리에 실패했습니다.");
      }
    });
  };

  return (
    <button
      onClick={handleClick}
      className={`flex items-center gap-1 p-2 transition-colors
        ${
          optimisticState.isLiked
            ? "text-rose-500"
            : "text-neutral-400 hover:text-rose-500"
        }`}
      disabled={isPending}
      aria-label={optimisticState.isLiked ? "좋아요 취소" : "좋아요"}
      aria-pressed={optimisticState.isLiked}
    >
      {optimisticState.isLiked ? (
        <HeartIcon aria-hidden className="size-10" />
      ) : (
        <OutlineHeartIcon aria-hidden className="size-10" />
      )}
      <span>{optimisticState.likeCount}</span>
    </button>
  );
}
