/**
 * File Name : app/(tabs)/profile/[username]/page.tsx
 * Description : 유저 프로필 페이지 (MyProfile 구조에 맞춰 개인화 최소화/모달 on-demand)
 * Author : 임도헌
 *
 * History
 * Date        Author   Status     Description
 * 2024.12.07  임도헌   Created
 * 2024.12.07  임도헌   Modified  유저 프로필 페이지 추가
 * 2024.12.07  임도헌   Modified  평균 평점 가져오는 로직 수정
 * 2024.12.07  임도헌   Modified  리뷰 가져오는 로직 수정
 * 2024.12.15  임도헌   Modified  다크모드 적용
 * 2025.04.29  임도헌   Modified  유저가 보유한 뱃지 체크 추가
 * 2025.05.26  임도헌   Modified  팔로우 여부 추가
 * 2025.10.08  임도헌   Modified  viewerId/viewerFollowingIds/viewerInfo 주입 + 병렬화
 * 2025.10.12  임도헌   Modified  MyProfile 구조 반영: viewerFollowingIds/viewerInfo 제거, 개인화 최소화
 * 2025.10.22  임도헌   Modified  viewerInfo 서버 주입 제거(캐시 파편화 방지), 낙관 표시용은 클라 훅으로 대체
 */

import { notFound, redirect } from "next/navigation";

import getSession from "@/lib/session";
import { getUserProfile } from "@/lib/user/getUserProfile";
import { getCachedInitialUserReviews } from "@/lib/user/getUserReviews";
import { getCachedUserAverageRating } from "@/lib/user/getUserAverageRating";
import { getCachedUserBadges } from "@/lib/user/getUserBadges";
import { getIsFollowing } from "@/lib/user/follow/getIsFollowing";

import type { UserProfile as UserProfileType } from "@/types/profile";
import UserProfile from "@/components/profile/UserProfile";
import { getInitialUserProducts } from "@/lib/product/getUserProducts";

export default async function UserProfilePage({
  params,
}: {
  params: { username: string };
}) {
  const session = await getSession();
  const viewerId = session?.id ?? null;

  // 프로필 조회 (본인이면 내부 redirect)
  const user = (await getUserProfile({
    username: params.username,
    redirectIfSelfToProfile: true,
  })) as UserProfileType | null;

  if (!user) return notFound();

  // 본인 리다이렉트 옵션이 true인데 가드가 실패했을 경우를 대비한 이중 가드
  if (viewerId && user.id === viewerId) {
    redirect("/profile");
  }

  // 공용 데이터는 캐시, 개인화는 최소만(팔로우 여부)
  const [
    averageRating,
    initialReviews,
    initialSellingProducts,
    initialSoldProducts,
    userBadges,
    isFollowing,
  ] = await Promise.all([
    getCachedUserAverageRating(user.id), // 캐시 사용 (user-average-rating-* tag)
    getCachedInitialUserReviews(user.id), // 캐시 사용 (user-reviews-initial-* tag)
    getInitialUserProducts({ type: "SELLING", userId: user.id }), // 도메인 정책에 따라 캐싱 고려
    getInitialUserProducts({ type: "SOLD", userId: user.id }),
    getCachedUserBadges(user.id), // 캐시 사용 (user-badges-* tag)
    viewerId ? getIsFollowing(viewerId, user.id) : Promise.resolve(false), // 개인화(비캐시)
  ]);

  return (
    <div className="min-h-screen dark:bg-neutral-900 bg-white transition-colors duration-200">
      <UserProfile
        user={{ ...user, isFollowing }}
        initialReviews={initialReviews}
        initialSellingProducts={initialSellingProducts}
        initialSoldProducts={initialSoldProducts}
        averageRating={averageRating}
        userBadges={userBadges}
        viewerId={viewerId ?? undefined}
      />
    </div>
  );
}
