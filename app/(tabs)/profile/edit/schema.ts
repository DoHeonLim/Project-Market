/**
 File Name : app/(tabs)/profile/edit
 Description : 프로필 수정 스키마
 Author : 임도헌
 
 History
 Date        Author   Status    Description
 2024.11.26  임도헌   Created
 2024.11.26  임도헌   Modified  프로필 수정 스키마 추가
 2024.11.27  임도헌   Modified  깃허브 연동한 유저의 경우 추가
*/

import {
  PASSWORD_MIN_LENGTH,
  PASSWORD_REGEX,
  PASSWORD_REGEX_ERROR,
} from "@/lib/constants";
import validator from "validator";
import { z } from "zod";

// 비밀번호 검증
const handleCheckPasswords = (isGithubId: boolean) => {
  return ({
    password,
    confirmPassword,
  }: {
    password?: string | null;
    confirmPassword?: string | null;
  }) =>
    !isGithubId ||
    (password && confirmPassword && password === confirmPassword);
};

export const profileEditSchema = (isGithubId: boolean) =>
  z
    .object({
      username: z
        .string({
          invalid_type_error: "유저명은 문자여야 합니다.",
          required_error: "유저명을 입력해주세요.",
        })
        .toLowerCase()
        .trim(),
      email: z
        .string()
        .email({
          message: "이메일을 입력해주세요.",
        })
        .toLowerCase()
        .optional()
        .nullable()
        .refine((val) => !isGithubId || !!val, {
          message: "깃허브 연동 사용자는 이메일을 필수로 입력해야 합니다.",
        }),
      avatar: z.string().optional().nullable(),
      phone: z
        .string()
        .trim()
        .optional()
        .nullable()
        .refine(
          (phone) => !phone || validator.isMobilePhone(phone, "ko-KR"), // 빈 값인 경우는 유효성 검사하지 않음
          "잘못된 번호 형식입니다."
        ),
      password: z
        .string()
        .min(isGithubId ? PASSWORD_MIN_LENGTH : 0)
        .regex(isGithubId ? PASSWORD_REGEX : /.*/, PASSWORD_REGEX_ERROR)
        .optional()
        .nullable()
        .refine((val) => !isGithubId || !!val, {
          message: "깃허브 연동 사용자는 비밀번호를 필수로 입력해야 합니다.",
        }),
      confirmPassword: z
        .string()
        .min(isGithubId ? PASSWORD_MIN_LENGTH : 0)
        .optional()
        .nullable(),
    })
    .refine(handleCheckPasswords(isGithubId), {
      message: "비밀번호가 일치하지 않습니다.",
      path: ["confirmPassword"],
    });

export type ProfileEditType = z.infer<ReturnType<typeof profileEditSchema>>;
