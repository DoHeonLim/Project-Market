/**
File Name : app/(tabs)/profile/edit/page
Description : 프로필 수정 서버 코드
Author : 임도헌

History
Date        Author   Status    Description
2024.11.25  임도헌   Created
2024.11.25  임도헌   Modified  프로필 수정 EditProfile 추가
2024.11.26  임도헌   Modified  getExistingUser 코드 추가
*/
"use server";

import db from "@/lib/db";
import { profileEditSchema, ProfileEditType } from "./schema";
import bcrypt from "bcrypt";
import { revalidatePath } from "next/cache";
import { getUser } from "../actions";
import { redirect } from "next/navigation";

export const EditProfile = async (FormData: FormData) => {
  // 폼 데이터 얻어오기
  const data = {
    username: FormData.get("username"),
    email: FormData.get("email"),
    phone: FormData.get("phone") === "" ? null : FormData.get("phone"),
    avatar: FormData.get("avatar"),
    password: FormData.get("password"),
    confirmPassword: FormData.get("confirmPassword"),
  };

  // 유저 데이터 얻어오기
  const user = await getUser();
  // 깃허브 아이디 및 이메일 존재 여부
  const isGithubIdAndEmail = !!user.github_id && !!!user.email;

  // 스키마 초기화
  const schema = profileEditSchema(isGithubIdAndEmail);
  // 스키마 검증
  const results = schema.safeParse(data);
  if (!results.success) {
    console.log(results.error.flatten());
    return { success: false, errors: results.error.flatten() };
  } else {
    // 업데이트할 데이터
    const updateData: ProfileEditType = {
      username: results.data.username,
      email: results.data.email,
      phone: results.data.phone,
      avatar: results.data.avatar,
    };

    // gitHub 연동 사용자의 경우 비밀번호 업데이트 추가
    if (isGithubIdAndEmail && results.data.password) {
      const hashedPassword = await bcrypt.hash(results.data.password, 12);
      updateData.password = hashedPassword;
    }

    // 사용자 정보 업데이트
    await db.user.update({
      where: { id: user.id },
      data: updateData,
    });

    // 페이지 재검증 및 리다이렉트
    revalidatePath("/profile");
    redirect("/profile");
  }
};

// 클라우드 플레어 이미지에 업로드 할 수 있는 주소를 제공하는 함수
export const getUploadUrl = async () => {
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${process.env.NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID}/images/v2/direct_upload`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_CLOUDFLARE_IMAGE_TOKEN}`,
      },
    }
  );
  const data = await response.json();
  return data;
};

// 유저명 제공함수
export const getExistingUsername = async (username: string) => {
  const result = await db.user.findUnique({
    where: { username },
    select: { id: true },
  });
  return result;
};

// 유저 이메일 제공 함수
export const getExistingUserEmail = async (email: string) => {
  const result = await db.user.findUnique({
    where: { email: email },
    select: { id: true },
  });
  return result;
};
