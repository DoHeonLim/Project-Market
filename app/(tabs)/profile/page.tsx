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
2024.12.24  임도헌   Modified  뱃지 데이터 추가
2025.05.16  임도헌   Modified  방송 데이터 추가
*/

import MyProfile from "@/components/my-profile";
import {
  getUser,
  getInitialUserReviews,
  logOut,
  getUserAverageRating,
  getAllBadges,
  getUserBadges,
} from "./actions";
import ThemeToggle from "@/components/theme/ThemeToggle";
import { getMyStreams } from "@/app/streams/actions";

export default async function ProfilePage() {
  const user = await getUser();
  const initialReviews = await getInitialUserReviews(user.id);
  const averageRating = await getUserAverageRating(user.id);
  const badges = await getAllBadges();
  const userBadges = await getUserBadges(user.id);
  // 내 방송 2개만 미리보기
  const myStreams = (await getMyStreams(user.id, 2)) || [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95 dark:from-background-dark dark:to-background-dark/95 transition-colors duration-200">
      <div className="mx-auto px-4 py-8">
        <div className="flex justify-end mb-4">
          <ThemeToggle />
        </div>
        <MyProfile
          user={user}
          initialReviews={initialReviews}
          averageRating={averageRating}
          logOut={logOut}
          badges={badges}
          userBadges={userBadges}
          myStreams={myStreams}
        />
      </div>
    </div>
  );
}
