/**
 * File Name : lib/user/getUserInfo
 * Description : 현재 로그인한 유저 프로필 조회 (userId 옵션 지원)
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2025.07.13  임도헌   Created   유저 프로필 조회 로직 분리
 * 2025.07.15  임도헌   Modified  userId 옵션 추가
 */
import db from "@/lib/db";
import getSession from "@/lib/session";

export const getUserInfo = async (userId?: number) => {
  const id = userId ?? (await getSession())?.id;
  if (!id) return null;

  return db.user.findUnique({
    where: { id },
    select: {
      id: true,
      username: true,
      avatar: true,
    },
  });
};
