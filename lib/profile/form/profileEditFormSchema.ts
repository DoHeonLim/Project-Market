/**
 * File Name : lib/profile/form/profileEditFormSchema
 * Description : 프로필 수정 스키마 (소셜/SMS 연동 분기 지원)
 * Author : 임도헌
 *
 * History
 * 2024.11.26  임도헌  Created
 * 2025.10.05  임도헌  Moved   app/(tabs)/profile/schema → lib/profile/form
 * 2025.10.31  임도헌  Modified 파라미터 의미 명확화(isSocialLogin) + 메시지 보강
 */

import { z } from "zod";
import validator from "validator";
import {
  PASSWORD_MIN_LENGTH,
  PASSWORD_REGEX,
  PASSWORD_REGEX_ERROR,
} from "@/lib/constants";

const handleCheckPasswords =
  (isSocialLogin?: boolean) =>
  ({
    password,
    confirmPassword,
  }: {
    password?: string | null;
    confirmPassword?: string | null;
  }) =>
    !isSocialLogin ||
    (password && confirmPassword && password === confirmPassword);

export const profileEditFormSchema = (isSocialLogin: boolean) =>
  z
    .object({
      username: z
        .string({
          invalid_type_error: "유저명은 문자여야 합니다.",
          required_error: "유저명을 입력해주세요.",
        })
        .toLowerCase()
        .trim()
        .min(3)
        .max(10),
      email: z
        .string()
        .email({ message: "유효한 이메일 주소를 입력해주세요." })
        .toLowerCase()
        .optional()
        .nullable()
        .refine((val) => !isSocialLogin || !!val, {
          message: "소셜/SMS 연동 사용자는 이메일을 필수로 입력해야 합니다.",
        }),
      avatar: z.string().optional().nullable(),
      phone: z
        .string()
        .trim()
        .optional()
        .nullable()
        .refine(
          (phone) => !phone || validator.isMobilePhone(phone, "ko-KR"),
          "잘못된 번호 형식입니다."
        ),
      password: z
        .string()
        .min(isSocialLogin ? PASSWORD_MIN_LENGTH : 0)
        .regex(isSocialLogin ? PASSWORD_REGEX : /.*/, PASSWORD_REGEX_ERROR)
        .optional()
        .nullable()
        .refine((val) => !isSocialLogin || !!val, {
          message: "소셜/SMS 연동 사용자는 비밀번호를 필수로 입력해야 합니다.",
        }),
      confirmPassword: z
        .string()
        .min(isSocialLogin ? PASSWORD_MIN_LENGTH : 0)
        .optional()
        .nullable(),
    })
    .refine(handleCheckPasswords(isSocialLogin), {
      message: "비밀번호가 일치하지 않습니다.",
      path: ["confirmPassword"],
    });

export type ProfileEditType = z.infer<ReturnType<typeof profileEditFormSchema>>;
