/**
File Name : app/create-account/actions
Description : 회원가입 페이지 Form 제출 시 
Author : 임도헌

History
Date        Author   Status    Description
2024.10.04  임도헌   Created
2024.10.04  임도헌   Modified  폼 제출 및 검증 기능 추가
*/
"use server";
import {
  PASSWORD_MIN_LENGTH,
  PASSWORD_REGEX,
  PASSWORD_REGEX_ERROR,
} from "@/lib/constants";
import { z } from "zod";

// 패스워드 검증
const handleCheckPasswords = ({
  password,
  confirmPassword,
}: {
  password: string;
  confirmPassword: string;
}) => password === confirmPassword;

// 유저 회원가입 폼 체크
const formSchema = z
  .object({
    username: z
      .string({
        invalid_type_error: "유저명은 문자여야 합니다.",
        required_error: "유저명을 입력해주세요.",
      })
      .toLowerCase()
      .trim(),
    email: z.string().email().toLowerCase(),
    password: z
      .string()
      .min(PASSWORD_MIN_LENGTH)
      .regex(PASSWORD_REGEX, PASSWORD_REGEX_ERROR),
    confirmPassword: z.string().min(PASSWORD_MIN_LENGTH),
  })
  .refine(handleCheckPasswords, {
    message: "비밀번호가 일치하지 않습니다.",
    path: ["confirmPassword"],
  });

export const createAccount = async (prevState: any, formData: FormData) => {
  const data = {
    username: formData.get("username"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  };

  const result = formSchema.safeParse(data);
  if (!result.success) {
    return result.error.flatten();
  } else {
    console.log(result.data);
  }
};
