/**
File Name : app/(auth)/github/complete/route
Description : 깃허브 소셜 로그인 기능
Author : 임도헌

History
Date        Author   Status    Description
2024.10.08  임도헌   Created
2024.10.08  임도헌   Modified  깃허브 소셜 로그인 기능 추가
2025.06.05  임도헌   Modified  Token, Profile 관련 함수 모듈화
*/

import { getAccessToken, getGithubProfile } from "@/lib/auth/github/oauth";
import { saveUserSession } from "@/lib/auth/saveUserSession";
import db from "@/lib/db";
import { notFound, redirect } from "next/navigation";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  if (!code) {
    return notFound();
  }
  const accessToken = await getAccessToken(code);
  const { id, avatar_url, login } = await getGithubProfile(accessToken);

  const existingUser = await db.user.findUnique({
    where: { github_id: id + "" },
    select: { id: true },
  });

  if (existingUser) {
    await saveUserSession(existingUser.id);
    return redirect("/profile");
  }
  const newUser = await db.user.create({
    data: {
      username: `${login}-gh`,
      github_id: id + "",
      avatar: avatar_url,
    },
    select: {
      id: true,
    },
  });
  await saveUserSession(newUser.id);
  return redirect("/profile");
}
