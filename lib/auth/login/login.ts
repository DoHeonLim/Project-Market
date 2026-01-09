/**
 * File Name : lib/auth/login/login
 * Description : 유저 로그인 비즈니스 로직
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2025.05.30  임도헌   Created
 * 2025.05.30  임도헌   Modified  유저 로그인 함수 분리
 */

import bcrypt from "bcrypt";
import db from "@/lib/db";

/**
 * 유저 인증만 수행합니다.
 * @returns 유저 ID 또는 null
 */
export async function verifyLogin({
  email,
  password,
}: {
  email: string;
  password: string;
}): Promise<number | null> {
  const user = await db.user.findUnique({
    where: { email },
    select: { id: true, password: true },
  });

  if (!user || !user.password) return null;

  const isCorrect = await bcrypt.compare(password, user.password);
  if (!isCorrect) return null;

  return user.id;
}
