/**
File Name : app/(auth)/sms/actions
Description : SMS 페이지 Form 제출 시 
Author : 임도헌

History
Date        Author   Status    Description
2024.10.04  임도헌   Created
2024.10.04  임도헌   Modified  폼 제출 및 검증 기능 추가
2024.10.11  임도헌   Modified  인증 번호 검증 때 전화번호까지 검증
2025.04.05  임도헌   Modified  twillo에서 CoolSMS로 변경
2025.06.05  임도헌   Modified  비즈니스 로직 분리
2025.06.07  임도헌   Modified  리디렉션 제거
*/

"use server";

import db from "@/lib/db";
import crypto from "crypto";
import { sendSMS } from "@/lib/auth/sms/send";
import { checkVerifiedSailorBadge } from "@/lib/check-badge-conditions";
import { phoneSchema, tokenSchema } from "@/lib/auth/sms/smsSchema";
import { generateUniqueToken } from "@/lib/auth/sms/token";
import { saveUserSession } from "@/lib/auth/saveUserSession";

export async function sendPhoneToken(formData: FormData) {
  const phone = formData.get("phone");

  const result = phoneSchema.safeParse(phone);
  if (!result.success) {
    return { error: result.error.errors[0].message };
  }

  const token = await generateUniqueToken();

  await db.sMSToken.deleteMany({
    where: { user: { phone: result.data } },
  });

  await db.sMSToken.create({
    data: {
      token,
      phone: result.data,
      user: {
        connectOrCreate: {
          where: { phone: result.data },
          create: {
            username: crypto.randomBytes(10).toString("hex"),
            phone: result.data,
          },
        },
      },
    },
  });

  await sendSMS(result.data, token);

  return { success: true };
}

export async function verifyPhoneToken(formData: FormData) {
  const token = formData.get("token");
  const phone = formData.get("phone");

  const tokenResult = await tokenSchema.safeParseAsync(token);
  const phoneResult = phoneSchema.safeParse(phone);

  if (!tokenResult.success || !phoneResult.success) {
    return {
      error: tokenResult.error?.errors?.[0]?.message ?? "인증 실패",
    };
  }

  const verifiedToken = await db.sMSToken.findUnique({
    where: {
      token: tokenResult.data.toString(),
      user: {
        phone: phoneResult.data,
      },
    },
    select: {
      id: true,
      userId: true,
    },
  });

  if (!verifiedToken) {
    return { error: "전화번호와 인증번호가 일치하지 않습니다." };
  }

  await db.sMSToken.delete({ where: { id: verifiedToken.id } });
  await checkVerifiedSailorBadge(verifiedToken.userId);

  // ✅ 세션 저장
  return saveUserSession(verifiedToken.userId);
}
