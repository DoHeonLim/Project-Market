/**
 * File Name : lib/user/duplicates
 * Description : 사용자 중복 체크 유틸(유저명/이메일)
 * Author : 임도헌
 *
 * History
 * Date        Author   Status     Description
 * 2024.11.26  임도헌   Created    app/(tabs)/profile/edit/actions 안 중복조회 최초 구현
 * 2025.10.08  임도헌   Moved      actions → lib/user 로 분리(getExistingUsername/getExistingUserEmail)
 */

"use server";
import db from "@/lib/db";

export async function getExistingUsername(username: string) {
  return db.user.findUnique({
    where: { username },
    select: { id: true },
  });
}

export async function getExistingUserEmail(email: string) {
  return db.user.findUnique({
    where: { email },
    select: { id: true },
  });
}
