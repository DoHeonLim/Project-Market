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
*/

import Profile from "@/components/profile-client";
import { getUser, logOut } from "./actions";

export default async function ProfilePage() {
  const user = await getUser();

  return <Profile user={user} logOut={logOut} />;
}
