/**
 File Name : lib/auth/create-account/createAccountSchema
 Description : 유저 회원가입 스키마
 Author : 임도헌
 
 History
 Date        Author   Status    Description
 2025.05.30  임도헌   Created
 2025.05.30  임도헌   Modified  기존 app\(auth)\create-account\actions 에 있던 스키마 분리
*/

import { z } from "zod";
import {
  PASSWORD_MIN_LENGTH,
  PASSWORD_REGEX,
  PASSWORD_REGEX_ERROR,
} from "@/lib/constants";
import validator from "validator";

// 유저 비밀번호 확인 함수
export const handleCheckPasswords = ({
  password,
  confirmPassword,
}: {
  password: string;
  confirmPassword: string;
}) => password === confirmPassword;

// 클라이언트-서버 공용 회원가입 스키마
// export const createAccountSchema = z
//   .object({
//     username: z
//       .string({
//         required_error: "닉네임을 입력해주세요.",
//         invalid_type_error: "닉네임은 문자열이어야 합니다.",
//       })
//       .min(3, { message: "닉네임은 최소 3자 이상이어야 합니다." })
//       .max(10, { message: "닉네임은 최대 10자까지 가능합니다." })
//       .toLowerCase()
//       .trim(),

//     email: z
//       .string({ required_error: "이메일을 입력해주세요." })
//       .email({ message: "유효한 이메일 주소를 입력해주세요." })
//       .toLowerCase(),

//     password: z
//       .string({ required_error: "비밀번호를 입력해주세요." })
//       .min(PASSWORD_MIN_LENGTH, {
//         message: `비밀번호는 최소 ${PASSWORD_MIN_LENGTH}자 이상이어야 합니다.`,
//       })
//       .regex(PASSWORD_REGEX, {
//         message: PASSWORD_REGEX_ERROR,
//       }),

//     confirmPassword: z
//       .string({ required_error: "비밀번호 확인을 입력해주세요." })
//       .min(PASSWORD_MIN_LENGTH, {
//         message: `비밀번호 확인은 최소 ${PASSWORD_MIN_LENGTH}자 이상이어야 합니다.`,
//       }),
//   })

//   // 비동기 중복 체크: username
//   .superRefine(async ({ username }, ctx) => {
//     const user = await db.user.findUnique({
//       where: { username },
//       select: { id: true },
//     });
//     if (user) {
//       ctx.addIssue({
//         code: "custom",
//         message: "이미 사용 중인 닉네임입니다.",
//         path: ["username"],
//       });
//     }
//   })

//   // 비동기 중복 체크: email
//   .superRefine(async ({ email }, ctx) => {
//     const user = await db.user.findUnique({
//       where: { email },
//       select: { id: true },
//     });
//     if (user) {
//       ctx.addIssue({
//         code: "custom",
//         message: "이미 사용 중인 이메일입니다.",
//         path: ["email"],
//       });
//     }
//   })
//   // 비밀번호 일치 확인
//   .refine(handleCheckPasswords, {
//     message: "비밀번호가 일치하지 않습니다.",
//     path: ["confirmPassword"],
//   });

export const createAccountSchema = z
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
      .email()
      .toLowerCase()
      .refine((email) => validator.isEmail(email), {
        message: "유효한 이메일 형식이 아닙니다.",
      }),
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

export type createAccountSchema = z.infer<typeof createAccountSchema>;
