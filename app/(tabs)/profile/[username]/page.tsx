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
 */

import { getInitialUserReviews, getUserAverageRating } from "../actions";
import { getUserProducts, getUserProfile } from "./actions";
import UserProfile from "@/components/user-profile";

export default async function UserProfilePage({
  params,
}: {
  params: { username: string };
}) {
  const userProfile = await getUserProfile(params.username); // 유저 프로필 가져오기
  const averageRating = await getUserAverageRating(userProfile.id); // 평균 평점 가져오기
  const initialSellingProducts = await getUserProducts(
    // 판매 제품 가져오기
    userProfile.id,
    "selling"
  );
  const initialSoldProducts = await getUserProducts(
    // 판매 완료 제품 가져오기
    userProfile.id,
    "sold"
  );
  const initialReviews = await getInitialUserReviews(userProfile.id); // 초기 리뷰 가져오기

  return (
    <div className="min-h-screen dark:bg-neutral-900 bg-white transition-colors duration-200">
      <UserProfile
        user={userProfile}
        initialReviews={initialReviews}
        initialSellingProducts={initialSellingProducts}
        initialSoldProducts={initialSoldProducts}
        averageRating={averageRating}
      />
    </div>
  );
}
