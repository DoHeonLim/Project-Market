/**
 * File Name : lib/user/getUserReviews
 * Description : 유저 프로필 리뷰 조회(초기/키셋 페이지네이션)
 * Author : 임도헌
 *
 * History
 * Date        Author   Status     Description
 * 2025.10.05  임도헌   Created
 * 2025.10.05  임도헌   Moved      app/(tabs)/profile/actions → lib/user로 분리
 * 2025.10.05  임도헌   Modified   created_at 도입 + 키셋 페이지네이션 안정화
 * 2025.10.07  임도헌   Modified   반환 타입(ProfileReview) 및 커서 타입 추가
 * 2025.10.23  임도헌   Modified   태그 네이밍 표준화와 wrapper 일관 적용
 * 2025.10.29  임도헌   Modified   types/profile & schema.prisma 반영(rate/payload), select 최소화, DTO 매핑, limit 클램프
 */
"use server";
import db from "@/lib/db";
import { unstable_cache as nextCache } from "next/cache";
import type { ProfileReview } from "@/types/profile";

export type ReviewCursor = { lastCreatedAt: Date; lastId: number } | null;

/**
 * revalidateTag 메모
 * - 리뷰 생성/수정/삭제 후:
 *   await revalidateTag(`user-reviews-initial-id-${sellerId}`);
 *   await revalidateTag(`user-average-rating-id-${sellerId}`);
 *
 * 인덱스(스키마 기준):
 * - Review: @@index([created_at]), @@index([userId]), @@index([productId])
 * - Product: @@index([userId]) (Seller), @@index([created_at])
 */

// 필요한 필드만 select (스키마/타입에 정확히 맞춤)
const reviewSelect = {
  id: true,
  created_at: true,
  rate: true,
  payload: true,
  user: { select: { id: true, username: true, avatar: true } }, // 작성자(리뷰어)
  product: {
    select: { id: true, title: true, userId: true, purchase_userId: true },
  },
} as const;

// Prisma → ProfileReview DTO 매핑 (types/profile 준수)
function toProfileReviewDTO(r: any): ProfileReview {
  return {
    id: r.id,
    created_at: r.created_at,
    rate: r.rate,
    payload: r.payload,
    user: r.user,
    product: { id: r.product.id, title: r.product.title },
  };
}

/** 초기 N개 (created_at desc, id desc) */
export const getInitialUserReviews = async (
  sellerId: number,
  limit = 10
): Promise<ProfileReview[]> => {
  const take = Math.max(1, Math.min(limit, 50)); // 간단한 클램프(음수 되지 않게)
  const rows = await db.review.findMany({
    where: {
      // 판매자(sellerId)에게 달린 리뷰 & 실제 구매 완료만
      product: { userId: sellerId, purchase_userId: { not: null } },
      // 자기 자신이 자기에게 쓴 리뷰 제외
      userId: { not: sellerId },
    },
    select: reviewSelect,
    orderBy: [{ created_at: "desc" }, { id: "desc" }],
    take,
  });
  return rows.map(toProfileReviewDTO);
};

/** 키셋 페이지네이션 (비캐시 권장: 개인화/스크롤 빈도 높음) */
export const getMoreUserReviews = async (
  sellerId: number,
  cursor?: ReviewCursor,
  limit = 10
): Promise<{ reviews: ProfileReview[]; nextCursor: ReviewCursor }> => {
  const take = Math.max(1, Math.min(limit, 50));

  const whereBase = {
    product: { userId: sellerId, purchase_userId: { not: null } },
    userId: { not: sellerId },
  } as const;

  const where = cursor
    ? {
        AND: [
          whereBase,
          {
            OR: [
              { created_at: { lt: cursor.lastCreatedAt } },
              { created_at: cursor.lastCreatedAt, id: { lt: cursor.lastId } },
            ],
          },
        ],
      }
    : whereBase;

  const rows = await db.review.findMany({
    where,
    select: reviewSelect,
    orderBy: [{ created_at: "desc" }, { id: "desc" }],
    take,
  });

  const reviews = rows.map(toProfileReviewDTO);
  const tail = rows[rows.length - 1];
  const nextCursor: ReviewCursor = tail
    ? { lastCreatedAt: tail.created_at as Date, lastId: tail.id }
    : null;

  return { reviews, nextCursor };
};

/** 초기 번들 캐시: per-id 태그 + 고정 키 */
export const getCachedInitialUserReviews = (sellerId: number, limit = 10) => {
  const cached = nextCache(
    async (uid: number, lim: number) => getInitialUserReviews(uid, lim),
    ["user-reviews-initial-by-id"],
    { tags: [`user-reviews-initial-id-${sellerId}`] }
  );
  return cached(sellerId, limit);
};
