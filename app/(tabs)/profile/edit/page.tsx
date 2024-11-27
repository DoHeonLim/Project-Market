/**
File Name : app/(tabs)/profile/edit/page
Description : 프로필 수정 페이지
Author : 임도헌

History
Date        Author   Status    Description
2024.11.25  임도헌   Created
2024.11.25  임도헌   Modified  프로필 페이지 레이아웃 추가
*/

import ProfileEditForm from "@/components/profile-edit-form";
import { getUser } from "../actions";

export default async function EditProfilePage() {
  const user = await getUser();
  return <ProfileEditForm user={user} />;
}
