/**
 * File Name : lib/user/getUserAverageRating
 * Description : 유저 평균 평점/리뷰 수 — Review.rate 기준
 * Author : 임도헌
 *
 * History
 * Date        Author   Status     Description
 * 2025.10.05  임도헌   Created
 * 2025.10.05  임도헌   Moved      app/(tabs)/profile/actions → lib/user로 분리
 * 2025.10.07  임도헌   Modified   반환 타입(ProfileAverageRating) 추가
 * 2025.10.23  임도헌   Modified   태그 네이밍 표준화와 wrapper 일관 적용
 * 2025.10.29  임도헌   Modified   Number 캐스팅 + 소수점 1자리 반올림(0~5 클램프)
 */
"use server";
import db from "@/lib/db";
import { unstable_cache as nextCache } from "next/cache";
import type { ProfileAverageRating } from "@/types/profile";

/**
 * revalidateTag 메모
 * - 리뷰 생성/수정/삭제 후:
 *   await revalidateTag(`user-average-rating-id-${sellerId}`);
 */

/** 판매자(userId) 상품에 달린 리뷰(본인 제외)의 평균/개수 */
export const getUserAverageRating = async (
  userId: number
): Promise<ProfileAverageRating> => {
  const result = await db.review.aggregate({
    where: {
      product: { userId, purchase_userId: { not: null } }, // 구매 완료 리뷰만
      userId: { not: userId }, // 자기 자신 제외
    },
    _avg: { rate: true },
    _count: { rate: true }, // rate가 non-null이므로 전체 리뷰 수와 동일
  });

  // 평균 → number 보장 + 0~5 클램프 + 소수점 1자리 반올림
  const rawAvg = result._avg.rate ?? 0;
  const avgNum = Number(rawAvg);
  const clamped = Math.min(5, Math.max(0, avgNum));
  const roundedTo1 = Math.round(clamped * 10) / 10; // ex) 4.46 → 4.5

  return {
    averageRating: roundedTo1,
    reviewCount: Number(result._count.rate ?? 0),
  };
};

/** 권장: 호출 시점 wrapper로 per-id 태그 주입 + 키 표준화 */
export const getCachedUserAverageRating = (userId: number) => {
  const cached = nextCache(
    async (uid: number) => getUserAverageRating(uid),
    // 키는 “함수 성격 + by-id”로 고정, 파라미터는 인자 해시로 구분됨
    ["user-average-rating-by-id"],
    { tags: [`user-average-rating-id-${userId}`] }
  );
  return cached(userId);
};
