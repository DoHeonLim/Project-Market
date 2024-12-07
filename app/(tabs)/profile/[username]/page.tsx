/**
 File Name : app/(tabs)/profile/[usernmae]/page
 Description : 유저 프로필 페이지
 Author : 임도헌
 
 History
 Date        Author   Status    Description
 2024.12.07  임도헌   Created
 2024.12.07  임도헌   Modified  유저 프로필 페이지 추가
 2024.12.07  임도헌   Modified  평균 평점 가져오는 로직 수정
 */

import { getUserAverageRating } from "../actions";
import { getUserProducts, getUserProfile } from "./actions";
import UserProfile from "@/components/user-profile";

export default async function UserProfilePage({
  params,
}: {
  params: { username: string };
}) {
  const userProfile = await getUserProfile(params.username);
  const averageRating = await getUserAverageRating(userProfile.id);
  const initialSellingProducts = await getUserProducts(
    userProfile.id,
    "selling"
  );
  const initialSoldProducts = await getUserProducts(userProfile.id, "sold");

  return (
    <UserProfile
      user={userProfile}
      initialSellingProducts={initialSellingProducts}
      initialSoldProducts={initialSoldProducts}
      averageRating={averageRating}
    />
  );
}
