/**
 File Name : app/(auth)/login/actions
 Description : 로그인 페이지 Form 제출 시 
 Author : 임도헌
 
 History
 Date        Author   Status    Description
 2024.10.04  임도헌   Created
 2024.10.04  임도헌   Modified  폼 제출 및 검증 기능 추가
 2024.10.06  임도헌   Modified  로그인 기능 완성
 2025.05.30  임도헌   Modified  비즈니스 로직 분리
 2025.06.07  임도헌   Modified  리디렉션 제거
 */
"use server";

import { verifyLogin } from "@/lib/auth/login/login";
import { saveUserSession } from "@/lib/auth/saveUserSession";
import { loginSchema } from "@/lib/auth/login/loginSchema";
import db from "@/lib/db";

const handleCheckEmailExists = async (email: string) => {
  const user = await db.user.findUnique({
    where: { email },
    select: { id: true },
  });
  return Boolean(user);
};

export async function login(_: any, formData: FormData) {
  const data = {
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const result = await loginSchema.safeParseAsync(data);
  if (!result.success) {
    return result.error.flatten();
  }

  const existUser = await handleCheckEmailExists(result.data.email);
  if (!existUser) {
    return {
      fieldErrors: {
        email: ["존재하지 않는 이메일입니다."],
        password: [],
      },
    };
  }

  const userId = await verifyLogin(result.data);

  if (!userId) {
    return {
      fieldErrors: {
        email: [],
        password: ["잘못된 비밀번호입니다."],
      },
    };
  }

  // 세션 저장
  return saveUserSession(userId);
}
