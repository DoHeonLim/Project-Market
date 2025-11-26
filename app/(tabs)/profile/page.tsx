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
 * 2025.11.12  임도헌   Modified   내부 max-w 제거(중앙 정렬 체감↑), Harbor 배너/WaveDivider 추가,
 *                                설정 드롭다운(ProfileSettingMenu) 상단 우측 배치
 */

// revalidateTag 트리거 메모
// - 프로필 코어:     user-core-id-${userId}
// - 팔로우 카운트:   user-followers-id-${userId}, user-following-id-${userId}
// - 리뷰 변경:       user-reviews-initial-id-${userId}, user-average-rating-id-${userId}
// - 배지 변경:       badges-all, user-badges-id-${userId}
// - 방송(채널) 변경:  user-streams-id-${ownerId}

import { redirect } from "next/navigation";
import ThemeToggle from "@/components/theme/ThemeToggle";
import MyProfile from "@/components/profile/MyProfile";
import ProfileSettingMenu from "@/components/profile/ProfileSettingMenu";

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
  const user = (await getUserProfile()) as UserProfile | null;
  if (!user) return redirect("/login");

  const [initialReviews, averageRating, badgesPair, streams]: [
    ProfileReview[],
    ProfileAverageRating,
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
        take: 6,
      });
      return items;
    })(),
  ]);

  return (
    <div className="min-h-screen bg-background dark:bg-neutral-950 transition-colors">
      {/* 상단 우측 도구 모음 */}
      <div
        className="px-4 sm:px-5 py-3 sm:py-4"
        role="region"
        aria-label="프로필 도구 모음"
      >
        <div className="flex justify-end gap-2">
          <ProfileSettingMenu emailVerified={!!user.emailVerified} />
          <ThemeToggle />
        </div>
      </div>

      {/* 본문 — AppWrapper가 폭을 고정하므로 추가 max-w 없이 좌우 여백만 */}
      <div className="px-4 sm:px-5 pb-8">
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
