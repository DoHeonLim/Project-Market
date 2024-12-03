/**
File Name : hooks/useReview
Description : 리뷰 훅
Author : 임도헌

History
Date        Author   Status    Description
2024.12.03  임도헌   Created
2024.12.03  임도헌   Modified  리뷰 작성 훅 추가
*/

import { createReview } from "@/app/(tabs)/profile/(product)/my-purchases/actions";
import { useState } from "react";

interface UseReviewProps {
  productId: number;
  userId: number;
}

export function useReview({ productId, userId }: UseReviewProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitReview = async (text: string, rating: number) => {
    try {
      setIsLoading(true);
      setError(null);
      await createReview(userId, productId, text, rating);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "리뷰 작성 중 오류가 발생했습니다"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    submitReview,
  };
}
