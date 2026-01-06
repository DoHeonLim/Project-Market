/**
 * File Name : app/(auth)/github/start/route
 * Description : 깃허브 소셜 로그인 기능
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2024.10.08  임도헌   Created
 * 2024.10.08  임도헌   Modified  깃허브 소셜 로그인 기능 추가
 * 2025.12.12  임도헌   Modified  OAuth state 쿠키 기반 검증 로직 추가
 */

import { NextResponse } from "next/server";
import crypto from "node:crypto";

export function GET() {
  const baseURL = "https://github.com/login/oauth/authorize";

  // 랜덤 state 생성 (CSRF 방지용)
  const state = crypto.randomBytes(32).toString("hex");

  const params = {
    client_id: process.env.GITHUB_CLIENT_ID!,
    scope: "read:user user:email",
    allow_signup: "true",
    state,
  };

  const formattedParams = new URLSearchParams(params).toString();
  const finalUrl = `${baseURL}?${formattedParams}`;

  const res = NextResponse.redirect(finalUrl);

  // state를 httpOnly 쿠키로 저장 (짧은 만료시간 + 보안 옵션)
  res.cookies.set("gh_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 10, // 10분 정도 유효
  });

  return res;
}
