/**
 * File Name : lib/auth/email/token
 * Description : 이메일 토큰 유틸 (발급/검증/매칭)
 * Author : 임도헌
 *
 * History
 * Date        Author   Status     Description
 * 2025.04.13  임도헌   Created    최초 구현 (app/api/email/verify/actions 내 로컬 함수)
 * 2025.10.14  임도헌   Moved      app/api/email/verify/actions → lib/auth/email/token.ts 로 모듈 분리
 * 2025.10.14  임도헌   Modified   토큰 발급/존재검사/이메일-토큰 매칭 유틸로 분리 export,
 *                                 action 단에서 schema/로직이 재사용 가능하도록 설계
 */
"use server";

import crypto from "crypto";
import db from "@/lib/db";

/** 6자리 토큰 발급(중복 시 재귀 재발급) */
export const handleGetToken = async (): Promise<string> => {
  const token = crypto.randomInt(100000, 999999).toString();
  const exists = await db.emailToken.findUnique({
    where: { token },
    select: { id: true },
  });
  if (exists) return handleGetToken();
  return token;
};

/** 토큰 존재 & 유효기간(만료 전) 검사 */
export const handleTokenExists = async (token: number): Promise<boolean> => {
  const row = await db.emailToken.findUnique({
    where: { token: token.toString() },
    select: { expires_at: true },
  });
  if (!row) return false;
  return row.expires_at >= new Date();
};

/** 토큰이 특정 이메일과 매칭되는지 검사(있으면 이메일 반환) */
export const handleEmailValid = async (
  token: number
): Promise<string | undefined> => {
  const row = await db.emailToken.findUnique({
    where: { token: token.toString() },
    select: { email: true },
  });
  return row?.email;
};
