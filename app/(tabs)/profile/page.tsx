/**
 * File Name : app/(tabs)/profile/page
 * Description : 프로필 페이지
 * Author : 임도헌
 *
 * History
 * Date        Author   Status     Description
 * 2024.10.05  임도헌   Created
 * 2024.10.05  임도헌   Modified   프로필 페이지 추가
 * 2024.10.07  임도헌   Modified   로그아웃 버튼 추가
 * 2024.11.25  임도헌   Modified   프로필 페이지 레이아웃 추가
 * 2024.11.28  임도헌   Modified   클라이언트 코드 분리
 * 2024.12.07  임도헌   Modified   리뷰 초깃값 이름 변경(initialReviews)
 * 2024.12.16  임도헌   Modified   테마 변경 버튼 추가
 * 2024.12.24  임도헌   Modified   뱃지 데이터 추가
 * 2025.05.16  임도헌   Modified   방송 데이터 추가
 * 2025.10.05  임도헌   Modified   데이터 병렬화 및 가드, 레이아웃 마이너 정리
 * 2025.10.07  임도헌   Modified   dynamic 적용 + 타입/데이터 통일
 * 2025.10.12  임도헌   Modified   병렬 로딩/타입정리/props 최종 정리
 * 2025.10.12  임도헌   Modified   getUserProfile 변경 반영
 * 2025.10.29  임도헌   Modified   Promise.all 튜플 타입 적용, 무효화 키 주석 추가
 * 2025.10.29  임도헌   Modified   비로그인 가드 리다이렉트 경로 수정(/login 등), revalidate 메모 보강
 */

// revalidateTag 트리거 메모
// - 프로필 코어:     user-core-id-${userId}                 // 아바타/닉네임/이메일 등 수정
// - 팔로우 카운트:   user-followers-id-${userId}, user-following-id-${userId}
// - 리뷰 변경:       user-reviews-initial-id-${userId}, user-average-rating-id-${userId}
// - 배지 변경:       badges-all, user-badges-id-${userId}
// - 방송(채널) 변경:  user-streams-id-${ownerId}

import { redirect } from "next/navigation";
import ThemeToggle from "@/components/theme/ThemeToggle";
import MyProfile from "@/components/profile/MyProfile";

import { getUserProfile } from "@/lib/user/getUserProfile";
import { getCachedInitialUserReviews } from "@/lib/user/getUserReviews";
import { getCachedUserAverageRating } from "@/lib/user/getUserAverageRating";
import {
  getCachedAllBadges,
  getCachedUserBadges,
} from "@/lib/user/getUserBadges";
import { getUserStreams } from "@/lib/stream/getUserStreams";
import { logOut } from "@/lib/auth/logOut";

import type { BroadcastSummary } from "@/types/stream";
import type {
  Badge,
  ProfileAverageRating,
  ProfileReview,
  UserProfile,
} from "@/types/profile";

export const dynamic = "force-dynamic"; // 개인화 페이지 → 전체 응답 캐시 회피

export default async function ProfilePage() {
  // 1) 로그인/세션 기준 자신의 프로필
  const user = (await getUserProfile()) as UserProfile | null;
  if (!user) {
    return redirect("/login");
  }

  // 2) 병렬 데이터 로딩 (초기 리뷰/평점/배지/스트림 1페이지)
  const [initialReviews, averageRating, badgesPair, streams]: [
    ProfileReview[],
    ProfileAverageRating, // { averageRating: number; reviewCount: number }
    { badges: Badge[]; userBadges: Badge[] },
    BroadcastSummary[],
  ] = await Promise.all([
    getCachedInitialUserReviews(user.id),
    getCachedUserAverageRating(user.id),
    (async () => {
      const [badges, userBadges] = await Promise.all([
        getCachedAllBadges(),
        getCachedUserBadges(user.id),
      ]);
      return { badges, userBadges };
    })(),
    (async () => {
      const { items } = await getUserStreams({
        ownerId: user.id,
        viewerId: user.id, // OWNER 버킷 히트
        take: 6, // 1p 캐시 범위
      });
      return items;
    })(),
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background/60 to-background/95 dark:from-background-dark/60 dark:to-background-dark/95 transition-colors duration-200">
      <div className="mx-auto px-4 py-8 max-w-6xl">
        <div className="flex justify-end mb-4">
          <ThemeToggle />
        </div>

        <MyProfile
          user={user}
          initialReviews={initialReviews}
          averageRating={averageRating}
          badges={badgesPair.badges}
          userBadges={badgesPair.userBadges}
          myStreams={streams}
          viewerId={user.id}
          logOut={logOut}
        />
      </div>
    </div>
  );
}
