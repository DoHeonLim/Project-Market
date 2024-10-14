/**
 File Name : app/login/actions
 Description : 로그인 페이지 Form 제출 시 
 Author : 임도헌
 
 History
 Date        Author   Status    Description
 2024.10.04  임도헌   Created
 2024.10.04  임도헌   Modified  폼 제출 및 검증 기능 추가
 2024.10.06  임도헌   Modified  로그인 기능 완성
 */

"use server";

import {
  PASSWORD_MIN_LENGTH,
  PASSWORD_REGEX,
  PASSWORD_REGEX_ERROR,
} from "@/lib/constants";
import db from "@/lib/db";
import { z } from "zod";
import bcrypt from "bcrypt";
import getSession from "@/lib/session";
import { redirect } from "next/navigation";

const handleCheckEmailExists = async (email: string) => {
  const user = await db.user.findUnique({
    where: {
      email,
    },
    select: {
      id: true,
    },
  });
  return Boolean(user);
};

const formSchema = z.object({
  email: z
    .string()
    .email()
    .toLowerCase()
    .refine(
      handleCheckEmailExists,
      "이 이메일을 사용하는 계정이 존재하지 않습니다."
    ),
  password: z
    .string({
      required_error: "비밀번호를 입력하세요.",
    })
    .min(PASSWORD_MIN_LENGTH)
    .regex(PASSWORD_REGEX, PASSWORD_REGEX_ERROR),
});

export const login = async (prevState: any, formData: FormData) => {
  const data = {
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const result = await formSchema.safeParseAsync(data);
  if (!result.success) {
    return result.error.flatten();
  } else {
    // 비밀번호 맞는지 확인 체크 해시
    const user = await db.user.findUnique({
      where: {
        email: result.data.email,
      },
      select: {
        id: true,
        password: true,
      },
    });
    const ok = await bcrypt.compare(result.data.password, user!.password ?? "");
    if (ok) {
      const session = await getSession();
      session.id = user!.id;
      await session.save();
      // 프로필로 이동
      redirect("/profile");
    } else {
      return {
        fieldErrors: {
          email: [],
          password: ["잘못된 비밀번호입니다."],
        },
      };
    }
  }
};
