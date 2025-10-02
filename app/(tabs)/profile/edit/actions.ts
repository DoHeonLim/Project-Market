/**
File Name : app/(tabs)/profile/edit/page
Description : 프로필 수정 서버 코드
Author : 임도헌

History
Date        Author   Status    Description
2024.11.25  임도헌   Created
2024.11.25  임도헌   Modified  프로필 수정 EditProfile 추가
2024.11.26  임도헌   Modified  getExistingUser 코드 추가
2024.11.28  임도헌   Modified  스키마 위치 변경
2025.04.10  임도헌   Modified  전화번호 인증 기능 추가
*/
"use server";

import db from "@/lib/db";
import { profileEditSchema, ProfileEditType } from "../schema";
import bcrypt from "bcrypt";
import { revalidatePath } from "next/cache";
import { getUser } from "../actions";
import { redirect } from "next/navigation";
import crypto from "crypto";
import coolsms from "coolsms-node-sdk";
import { checkVerifiedSailorBadge } from "@/lib/check-badge-conditions";

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
  // 소셜 로그인 여부
  const isSocialLogin =
    (!!user.github_id && !!!user.email) || (!!user.phone && !!!user.email);

  // 스키마 초기화
  const schema = profileEditSchema(isSocialLogin);
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

    // 이메일 없을 경우 비밀번호 업데이트 추가
    if (isSocialLogin && results.data.password) {
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
    `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/images/v2/direct_upload`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
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

// 전화번호 인증 코드 전송
export const sendPhoneVerification = async (phone: string) => {
  try {
    // 현재 로그인한 유저 정보 가져오기
    const user = await getUser();

    // 이미 존재하는 토큰 삭제
    await db.sMSToken.deleteMany({
      where: {
        phone: phone,
      },
    });

    // 새로운 토큰 생성
    const token = crypto.randomInt(100000, 999999).toString();

    // 토큰 저장 (현재 유저와 연결)
    await db.sMSToken.create({
      data: {
        token,
        phone,
        user: {
          connect: {
            id: user.id,
          },
        },
      },
    });

    // SMS 전송
    const apiKey = process.env.COOLSMS_API_KEY!;
    const apiSecret = process.env.COOLSMS_API_SECRET!;
    const sender = process.env.COOLSMS_SENDER_NUMBER!;

    const messageService = new coolsms(apiKey, apiSecret);

    await messageService.sendOne({
      to: phone,
      from: sender,
      text: `당신의 BoardPort 인증 번호는 ${token}입니다.`,
      type: "SMS",
      autoTypeDetect: false,
    });

    return { success: true };
  } catch (error) {
    console.error("SMS 전송 실패:", error);
    return { success: false, error: "SMS 전송에 실패했습니다." };
  }
};

// 전화번호 인증 코드 확인
export const verifyPhoneToken = async (phone: string, token: string) => {
  try {
    const smsToken = await db.sMSToken.findFirst({
      where: {
        token,
        phone,
      },
      select: {
        id: true,
        userId: true,
      },
    });

    if (!smsToken) {
      return { success: false, error: "인증번호가 일치하지 않습니다." };
    }

    // 인증 성공 후 토큰 삭제
    await db.sMSToken.delete({
      where: {
        id: smsToken.id,
      },
    });

    // VERIFIED_SAILOR 뱃지 부여
    await checkVerifiedSailorBadge(smsToken.userId);

    return { success: true };
  } catch (error) {
    console.error("인증 확인 실패:", error);
    return { success: false, error: "인증 확인에 실패했습니다." };
  }
};
