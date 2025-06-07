/**
File Name : app/(auth)/create-account/actions
Description : 회원가입 페이지 server 액션
Author : 임도헌

History
Date        Author   Status    Description
2024.10.04  임도헌   Created
2024.10.04  임도헌   Modified  폼 제출 및 검증 기능 추가
2024.10.06  임도헌   Modified  세션 추가 및 회원가입 기능 완성
2025.05.30  임도헌   Modified  비즈니스 로직 분리
*/
"use server";

import { createAccount } from "@/lib/auth/create-account/createAccount";
import { createAccountSchema } from "@/lib/auth/create-account/createAccountSchema";
import db from "@/lib/db";

export async function submitCreateAccount(_: any, formData: FormData) {
  const data = {
    username: formData.get("username"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  };

  const parsed = await createAccountSchema.safeParseAsync(data);
  if (!parsed.success) {
    return parsed.error.flatten();
  }

  // 서버 액션 내에서 DB 유효성 검사
  const [existingUsername, existingEmail] = await Promise.all([
    db.user.findUnique({
      where: { username: parsed.data.username },
      select: { id: true },
    }),
    db.user.findUnique({
      where: { email: parsed.data.email },
      select: { id: true },
    }),
  ]);

  const fieldErrors: Record<string, string[]> = {};
  if (existingUsername) {
    fieldErrors.username = ["이미 존재하는 유저명입니다."];
  }
  if (existingEmail) {
    fieldErrors.email = ["이미 존재하는 이메일입니다."];
  }
  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }

  // 유저 생성 후 저장, profile로 리디렉션
  await createAccount(parsed.data);
}
