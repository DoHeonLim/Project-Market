/**
File Name : app/api/email/verify/actions
Description : 이메일 인증 액션
Author : 임도헌

History
Date        Author   Status    Description
2025.04.13  임도헌   Created
*/

"use server";

import crypto from "crypto";
import { z } from "zod";
import validator from "validator";
import { redirect } from "next/navigation";
import db from "@/lib/db";
import { checkVerifiedSailorBadge } from "@/lib/check-badge-conditions";
import { Resend } from "resend";

interface IActionState {
  token: boolean;
  email?: string;
  error?: {
    formErrors?: string[];
  };
}

const handleGetToken = async () => {
  const token = crypto.randomInt(100000, 999999).toString();
  // 여러 유저가 이메일 사용 시 토큰값이 겹치면 다시 발급해야됨.
  const exists = await db.emailToken.findUnique({
    where: {
      token,
    },
    select: {
      id: true,
    },
  });
  if (exists) {
    return handleGetToken();
  } else {
    return token;
  }
};

const emailSchema = z
  .string()
  .trim()
  .refine((email) => validator.isEmail(email), "잘못된 이메일 형식입니다.");

const handleTokenExists = async (token: number) => {
  const exists = await db.emailToken.findUnique({
    where: {
      token: token.toString(),
    },
    select: {
      id: true,
      expiresAt: true,
    },
  });
  if (!exists) return false;
  if (exists.expiresAt < new Date()) return false;
  return true;
};

const handleEmailValid = async (token: number) => {
  const exists = await db.emailToken.findUnique({
    where: {
      token: token.toString(),
    },
    select: {
      email: true,
    },
  });
  return exists?.email;
};

const tokenSchema = z.coerce
  .number()
  .min(100000, "인증번호는 6자리 입니다.")
  .max(999999, "인증번호는 6자리 입니다.")
  .refine(handleTokenExists, "인증번호를 다시 입력해주세요.")
  .refine(handleEmailValid, "인증번호와 이메일이 매치되지 않습니다.");

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async (email: string, token: string) => {
  try {
    await resend.emails.send({
      from: "Board Port <noreply@boardport.com>",
      to: email,
      subject: "이메일 인증",
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: sans-serif;">
          <h2 style="color: #333; text-align: center;">이메일 인증</h2>
          <p style="color: #666; line-height: 1.6;">안녕하세요! 이메일 인증을 위해 아래의 인증번호를 입력해주세요.</p>
          <div style="background-color: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
            <h1 style="color: #007bff; margin: 0; font-size: 32px; letter-spacing: 4px;">${token}</h1>
          </div>
          <p style="color: #666; line-height: 1.6;">이 인증번호는 10분 동안 유효합니다.</p>
          <p style="color: #666; line-height: 1.6; font-size: 14px;">본인이 요청하지 않은 경우 이 이메일을 무시하셔도 됩니다.</p>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #999; font-size: 12px;">
            <p>© 2025 Board Port. All rights reserved.</p>
          </div>
        </div>
      `,
    });
    console.log(`이메일 전송 성공: ${email}`);
  } catch (error) {
    console.error("이메일 전송 실패:", error);
    throw new Error("이메일 전송에 실패했습니다.");
  }
};

export const verifyEmail = async (
  prevState: IActionState,
  formData: FormData
) => {
  const email = formData.get("email");
  const token = formData.get("token");
  const resend = formData.get("resend");

  if (!prevState.token || resend === "true") {
    const result = emailSchema.safeParse(email);
    if (!result.success) {
      return {
        token: false,
        error: result.error.flatten(),
      };
    } else {
      // 유저 이메일 토큰 삭제
      await db.emailToken.deleteMany({
        where: {
          user: {
            email: result.data,
          },
        },
      });
      const token = await handleGetToken();
      await db.emailToken.create({
        data: {
          token,
          email: result.data,
          expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10분 후 만료
          user: {
            connect: {
              email: result.data,
            },
          },
        },
      });

      await sendEmail(result.data, token);

      return {
        token: true,
        email: result.data,
      };
    }
  } else {
    const tokenResult = await tokenSchema.safeParseAsync(token);
    const emailResult = emailSchema.safeParse(prevState.email);
    if (!tokenResult.success) {
      return {
        token: true,
        error: tokenResult.error.flatten(),
      };
    } else if (!emailResult.success) {
      return {
        token: true,
        error: emailResult.error.flatten(),
      };
    } else {
      const token = await db.emailToken.findUnique({
        where: {
          token: tokenResult.data.toString(),
          user: {
            email: emailResult.data,
          },
        },
        select: {
          id: true,
          userId: true,
        },
      });

      if (!token) {
        return {
          ...prevState,
          error: {
            formErrors: ["이메일과 인증번호가 일치하지 않습니다."],
          },
        };
      }

      await db.emailToken.delete({
        where: {
          id: token!.id,
        },
      });

      // 이메일 인증 상태 업데이트
      await db.user.update({
        where: {
          id: token!.userId,
        },
        data: {
          emailVerified: true,
        },
      });

      // VERIFIED_SAILOR 뱃지 부여
      await checkVerifiedSailorBadge(token.userId);
      redirect("/profile");
    }
  }
};
