/**
File Name : hooks/useReview
Description : 리뷰 훅
Author : 임도헌

History
Date        Author   Status    Description
2024.12.03  임도헌   Created
2024.12.03  임도헌   Modified  리뷰 작성 훅 추가
2024.12.04  임도헌   Modified  리뷰 작성 로직을 구매자, 판매자 분리
2024.12.22  임도헌   Modified  createReview코드로 변경(구매자, 판매자)
*/
import { createReview } from "@/app/(tabs)/profile/(product)/actions";
import { useState } from "react";
import { toast } from "sonner";

interface UseReviewProps {
  productId: number;
  userId: number;
  type: "buyer" | "seller";
}

export function useReview({ productId, userId, type }: UseReviewProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitReview = async (text: string, rating: number) => {
    try {
      setIsLoading(true);
      setError(null);

      if (type === "buyer") {
        await createReview(userId, productId, text, rating, "buyer");
      } else {
        await createReview(userId, productId, text, rating, "seller");
      }

      toast.success("리뷰가 작성되었습니다.");
      return true;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "리뷰 작성 중 오류가 발생했습니다";
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
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
