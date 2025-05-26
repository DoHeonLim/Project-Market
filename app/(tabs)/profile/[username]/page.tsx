/**
 File Name : app/(tabs)/profile/[usernmae]/page
 Description : 유저 프로필 페이지
 Author : 임도헌
 
 History
 Date        Author   Status    Description
 2024.12.07  임도헌   Created
 2024.12.07  임도헌   Modified  유저 프로필 페이지 추가
 2024.12.07  임도헌   Modified  평균 평점 가져오는 로직 수정
 2024.12.07  임도헌   Modified  리뷰 가져오는 로직 수정
 2024.12.15  임도헌   Modified  다크모드 적용
 2025.04.29  임도헌   Modified  유저가 보유한 뱃지 체크 추가
 2025.05.26  임도헌   Modified  팔로우 여부 추가
 */

import getSession from "@/lib/session";
import {
  getInitialUserReviews,
  getUserAverageRating,
  getUserBadges,
} from "../actions";
import { getisFollowing, getUserProducts, getUserProfile } from "./actions";
import UserProfile from "@/components/user-profile";

export default async function UserProfilePage({
  params,
}: {
  params: { username: string };
}) {
  const session = await getSession();
  const userId = session?.id;
  const userProfile = await getUserProfile(params.username, true);

  // 현재 로그인한 사용자가 이 프로필의 주인을 팔로우하고 있는지 확인
  let isFollowing = false;
  if (userId) {
    isFollowing = await getisFollowing(userId, userProfile.id);
  }

  const averageRating = await getUserAverageRating(userProfile.id);
  const initialSellingProducts = await getUserProducts(
    userProfile.id,
    "selling"
  );
  const initialSoldProducts = await getUserProducts(userProfile.id, "sold");
  const initialReviews = await getInitialUserReviews(userProfile.id);
  const userBadges = await getUserBadges(userProfile.id);

  return (
    <div className="min-h-screen dark:bg-neutral-900 bg-white transition-colors duration-200">
      <UserProfile
        user={{
          ...userProfile,
          isFollowing,
        }}
        initialReviews={initialReviews}
        initialSellingProducts={initialSellingProducts}
        initialSoldProducts={initialSoldProducts}
        averageRating={averageRating}
        userBadges={userBadges}
      />
    </div>
  );
}
