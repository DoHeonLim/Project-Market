/**
File Name : app/(tabs)/profile/action
Description : 프로필 서버 코드
Author : 임도헌

History
Date        Author   Status    Description
2024.11.25  임도헌   Created
2024.11.25  임도헌   Modified  프로필 수정 코드 추가
2024.11.28  임도헌   Modified  프로필 수정 코드 완성
*/
"use server";

import bcrypt from "bcrypt";
import db from "@/lib/db";
import getSession from "@/lib/session";
import { notFound, redirect } from "next/navigation";
import { passwordUpdateSchema } from "./schema";

export const getUser = async () => {
  const session = await getSession();
  if (session.id) {
    const user = await db.user.findUnique({
      where: {
        id: session.id,
      },
    });
    if (user) {
      return user;
    }
  }
  notFound();
};

export const logOut = async () => {
  "use server";
  const session = await getSession();
  session.destroy();
  redirect("/");
};

type ChangePasswordResponse = {
  success: boolean;
  errors?: {
    currentPassword?: string[];
    password?: string[];
    confirmPassword?: string[];
  };
};

export const changePassword = async (
  FormData: FormData
): Promise<ChangePasswordResponse> => {
  // 폼 데이터 얻어오기
  const data = {
    currentPassword: FormData.get("currentPassword"),
    password: FormData.get("password"),
    confirmPassword: FormData.get("confirmPassword"),
  };

  // 유저 데이터 얻어오기
  const user = await getUser();
  console.log("유저", user);

  const results = passwordUpdateSchema.safeParse(data);
  if (!results.success) {
    return {
      success: false,
      errors: results.error.flatten().fieldErrors,
    };
  } else {
    // 현재 비밀번호 맞는지 체크
    const isCheckCurrentPassword = await bcrypt.compare(
      results.data.currentPassword,
      user.password ?? ""
    );

    if (!isCheckCurrentPassword) {
      return {
        success: false,
        errors: {
          currentPassword: ["현재 비밀번호가 일치하지 않습니다."],
        },
      };
    } else {
      // 변경할 비밀번호 암호화
      const hashedPassword = await bcrypt.hash(results.data.password, 12);
      console.log(hashedPassword);
      await db.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      });

      return { success: true };
    }
  }
};
