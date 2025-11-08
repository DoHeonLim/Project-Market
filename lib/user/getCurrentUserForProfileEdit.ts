/**
 * File Name : lib/user/getCurrentUserForProfileEdit
 * Description : 프로필 편집 화면용 현재 사용자 조회(폼에 필요한 필드만)
 * Author : 임도헌
 *
 * History
 * Date        Author   Status     Description
 * 2024.11.25  임도헌   Created    app/(tabs)/profile/edit/actions 안 getUser 최초 구현
 * 2025.10.08  임도헌   Moved      actions → lib/user 로 분리(getCurrentUserForProfileEdit)
 * 2025.10.08  임도헌   Modified   select 필드 단순화(편집 폼 필수 필드만)
 */

"use server";

import "server-only";
import db from "@/lib/db";
import getSession from "@/lib/session";

export type CurrentUserForProfileEdit = {
  id: number;
  username: string;
  email: string | null;
  avatar: string | null;
  phone: string | null;
  github_id: string | null;
  created_at: Date;
  updated_at: Date;
  emailVerified: boolean;

  /** UI 분기용 파생 플래그 (클라이언트에 해시 미노출) */
  isSocialLogin: boolean;
  needsPasswordSetup: boolean; // 소셜/SMS 연동 + 아직 비밀번호 미설정
};

export async function getCurrentUserForProfileEdit(): Promise<CurrentUserForProfileEdit | null> {
  const session = await getSession();
  if (!session?.id) return null;

  // 비밀번호는 선택(select)해서 서버에서만 판별하고 응답에서는 제거
  const user = await db.user.findUnique({
    where: { id: session.id },
    select: {
      id: true,
      username: true,
      email: true,
      avatar: true,
      phone: true,
      github_id: true,
      created_at: true,
      updated_at: true,
      emailVerified: true,
      password: true, // 파생 플래그 계산용(응답에는 포함하지 않음)
    },
  });

  if (!user) return null;

  const isSocialLogin = (!!user.github_id || !!user.phone) && !user.email;
  const needsPasswordSetup = isSocialLogin && !user.password;

  return {
    id: user.id,
    username: user.username,
    email: user.email,
    avatar: user.avatar,
    phone: user.phone,
    github_id: user.github_id,
    created_at: user.created_at,
    updated_at: user.updated_at,
    emailVerified: user.emailVerified,
    isSocialLogin,
    needsPasswordSetup,
  };
}
