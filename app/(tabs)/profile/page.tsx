/**
File Name : app/(tabs)/profile/page
Description : 프로필 페이지
Author : 임도헌

History
Date        Author   Status    Description
2024.10.05  임도헌   Created
2024.10.05  임도헌   Modified  프로필 페이지 추가
2024.10.07  임도헌   Modified  로그아웃 버튼 추가
2024.11.25  임도헌   Modified  프로필 페이지 레이아웃 추가
2024.11.28  임도헌   Mdofieid  클라이언트 코드 분리
2024.12.07  임도헌   Modified  리뷰 초깃값 이름 변경(initialReviews)
2024.12.16  임도헌   Modified  테마 변경 버튼 추가
*/

import MyProfile from "@/components/my-profile";
import {
  getUser,
  getInitialUserReviews,
  logOut,
  getUserAverageRating,
} from "./actions";
import ThemeToggle from "@/components/theme/ThemeToggle";

export default async function ProfilePage() {
  const user = await getUser();
  const initialReviews = await getInitialUserReviews(user.id);
  const averageRating = await getUserAverageRating(user.id);

  return (
    <div className="relative min-h-screen dark:bg-neutral-900 bg-white transition-colors duration-200">
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      <MyProfile
        user={user}
        initialReviews={initialReviews}
        averageRating={averageRating}
        logOut={logOut}
      />
    </div>
  );
}
