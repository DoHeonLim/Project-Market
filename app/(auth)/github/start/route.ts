/**
File Name : app/(auth)/github/start/route
Description : 깃허브 소셜 로그인 기능
Author : 임도헌

History
Date        Author   Status    Description
2024.10.08  임도헌   Created
2024.10.08  임도헌   Modified  깃허브 소셜 로그인 기능 추가
*/

import { redirect } from "next/navigation";

export function GET() {
  const baseURL = "https://github.com/login/oauth/authorize";
  const params = {
    client_id: process.env.GITHUB_CLIENT_ID!,
    scope: "read:user, user:email",
    allow_signup: "true",
  };
  const formattedParams = new URLSearchParams(params).toString();
  const finalUrl = `${baseURL}?${formattedParams}`;
  return redirect(finalUrl);
}
