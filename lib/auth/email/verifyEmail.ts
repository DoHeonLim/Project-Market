/**
 * File Name : lib/auth/email/verifyEmail
 * Description : 이메일 인증 서버 액션 (토큰 전송/검증)
 * Author : 임도헌
 *
 * History
 * Date        Author   Status     Description
 * 2025.04.13  임도헌   Created    최초 구현: app/api/email/verify/actions
 * 2025.04.21  임도헌   Modified   성공 시 redirect 대신 success 플래그 반환
 * 2025.10.14  임도헌   Moved      app/api/email/verify/actions → lib/auth/email/verifyEmail.ts 로 이동
 * 2025.10.14  임도헌   Modified   토큰/메일러 유틸 분리(import)
 * 2025.10.29  임도헌   Modified   재전송 쿨다운 서버 강제(180s) + 기존 토큰 유지,
 *                                 cooldownRemaining/sent 반환, 모달 닫아도 우회 불가
 */

"use server";

import { z } from "zod";
import validator from "validator";
import db from "@/lib/db";
import { revalidateTag } from "next/cache";
import { checkVerifiedSailorBadge } from "@/lib/check-badge-conditions";
import {
  handleGetToken,
  handleTokenExists,
  handleEmailValid,
} from "@/lib/auth/email/token";
import { sendEmail } from "./mailer";

export interface IActionState {
  token: boolean;
  email?: string;
  error?: { formErrors?: string[] };
  success?: boolean;
  cooldownRemaining?: number; // 남은 쿨다운(초)
  sent?: boolean; // 이번 요청에서 실제 메일 발송 여부
}

const emailSchema = z
  .string()
  .trim()
  .refine((email) => validator.isEmail(email), "잘못된 이메일 형식입니다.");

const tokenSchema = z.coerce
  .number()
  .min(100000, "인증번호는 6자리 입니다.")
  .max(999999, "인증번호는 6자리 입니다.")
  .refine(handleTokenExists, "인증번호를 다시 입력해주세요.")
  .refine(handleEmailValid, "인증번호와 이메일이 매치되지 않습니다.");

const RESEND_COOLDOWN_SECONDS = 180; // 3분
const TOKEN_TTL_MS = 10 * 60 * 1000; // 10분 유효

export const verifyEmail = async (
  prevState: IActionState,
  formData: FormData
): Promise<IActionState> => {
  const email = formData.get("email");
  const token = formData.get("token");
  const resend = formData.get("resend");

  // 1) 코드 발송(최초/재전송/재오픈 시 조회 포함)
  if (!prevState.token || resend === "true") {
    const result = emailSchema.safeParse(email);
    if (!result.success) {
      return { token: false, error: result.error.flatten() };
    }

    const emailVal = result.data;

    // 최근 발송 기록 조회(가장 최신)
    const latest = await db.emailToken.findFirst({
      where: { user: { email: emailVal } },
      orderBy: { expires_at: "desc" }, // created_at 없는 환경에서도 동작
      select: { id: true, expires_at: true },
    });

    if (latest) {
      // expires_at = created_at + 10분 → createdAt 역산
      const sentAtMs = latest.expires_at.getTime() - TOKEN_TTL_MS;
      const elapsed = Math.floor((Date.now() - sentAtMs) / 1000);
      const remain = Math.max(0, RESEND_COOLDOWN_SECONDS - elapsed);

      if (remain > 0) {
        // 쿨다운 진행 중 → 재전송 금지, 남은 시간만 안내
        return {
          token: true,
          email: emailVal,
          cooldownRemaining: remain,
          sent: false,
        };
      }
    }

    // 쿨다운 지남 → 기존 토큰 정리 후 신규 발급/발송
    await db.emailToken.deleteMany({ where: { user: { email: emailVal } } });

    const code = await handleGetToken();
    await db.emailToken.create({
      data: {
        token: code,
        email: emailVal,
        expires_at: new Date(Date.now() + TOKEN_TTL_MS), // 10분
        user: { connect: { email: emailVal } },
      },
    });

    await sendEmail(emailVal, code);

    return {
      token: true,
      email: emailVal,
      cooldownRemaining: RESEND_COOLDOWN_SECONDS,
      sent: true,
    };
  }

  // 2) 코드 검증
  const tokenResult = await tokenSchema.safeParseAsync(token);
  const emailResult = emailSchema.safeParse(prevState.email);
  if (!tokenResult.success) {
    return { token: true, error: tokenResult.error.flatten() };
  }
  if (!emailResult.success) {
    return { token: true, error: emailResult.error.flatten() };
  }

  const tokenRow = await db.emailToken.findUnique({
    where: {
      token: tokenResult.data.toString(),
      user: { email: emailResult.data },
    },
    select: { id: true, userId: true },
  });

  if (!tokenRow) {
    return {
      ...prevState,
      error: { formErrors: ["이메일과 인증번호가 일치하지 않습니다."] },
    };
  }

  // 사용 후 삭제
  await db.emailToken.delete({ where: { id: tokenRow.id } });

  // 이메일 인증 처리
  await db.user.update({
    where: { id: tokenRow.userId },
    data: { emailVerified: true },
  });

  // 뱃지 부여
  await checkVerifiedSailorBadge(tokenRow.userId);

  revalidateTag(`user-profile-id-${tokenRow.userId}`);
  revalidateTag(`user-badges-id-${tokenRow.userId}`);

  return { token: true, email: emailResult.data, success: true };
};
