/**
File Name : app/(auth)/sms/actions
Description : SMS 페이지 Form 제출 시 
Author : 임도헌

History
Date        Author   Status    Description
2024.10.04  임도헌   Created
2024.10.04  임도헌   Modified  폼 제출 및 검증 기능 추가
2024.10.11  임도헌   Modified  인증 번호 검증 때 전화번호까지 검증
2025.04.05  임도헌   Modified  twillo에서 CoolSMS로 변경
*/
"use server";

import crypto from "crypto";
import { z } from "zod";
import validator from "validator";
import { redirect } from "next/navigation";
import db from "@/lib/db";
import getSession from "@/lib/session";
import coolsms from "coolsms-node-sdk";
import { checkVerifiedSailorBadge } from "@/lib/check-badge-conditions";

interface IActionState {
  token: boolean;
  phone?: string;
}

const handleGetToken = async () => {
  const token = crypto.randomInt(100000, 999999).toString();
  // 여러 유저가 sms 사용 시 토큰값이 겹치면 다시 발급해야됨.
  const exists = await db.sMSToken.findUnique({
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

const phoneSchema = z
  .string()
  .trim()
  .refine(
    (phone) => validator.isMobilePhone(phone, "ko-KR"),
    "잘못된 번호 형식입니다."
  );

const handleTokenExists = async (token: number) => {
  const exists = await db.sMSToken.findUnique({
    where: {
      token: token.toString(),
    },
    select: {
      id: true,
    },
  });
  return Boolean(exists);
};

const handlePhoneNumberValid = async (token: number) => {
  const exists = await db.sMSToken.findUnique({
    where: {
      token: token.toString(),
    },
    select: {
      phone: true,
    },
  });
  return exists?.phone;
};

const tokenSchema = z.coerce
  .number()
  .min(100000, "인증번호는 6자리 입니다.")
  .max(999999, "인증번호는 6자리 입니다.")
  .refine(handleTokenExists, "인증번호를 다시 입력해주세요.")
  .refine(
    handlePhoneNumberValid,
    "인증번호와 휴대폰 번호가 매치되지 않습니다."
  );

const sendSMS = async (phone: string, token: string) => {
  const apiKey = process.env.COOLSMS_API_KEY!;
  const apiSecret = process.env.COOLSMS_API_SECRET!;
  const sender = process.env.COOLSMS_SENDER_NUMBER!;

  // CoolSMS객체 만든다.
  const messageService = new coolsms(apiKey, apiSecret);

  try {
    await messageService.sendOne({
      to: phone, // 수신자
      from: sender, // 발신자
      text: `당신의 BoardPort 인증 번호는 ${token}입니다.`, // 메시지
      type: "SMS", // 메세지의 타입 SMS(단문)
      autoTypeDetect: false, // 메시지 자동 감지 여부
    });
  } catch (error) {
    console.error("SMS 전송 실패:", error);
    throw new Error("SMS 전송에 실패했습니다.");
  }
};

export const smsLogin = async (prevState: IActionState, formData: FormData) => {
  const phone = formData.get("phone");
  const token = formData.get("token");
  if (!prevState.token) {
    const result = phoneSchema.safeParse(phone);
    if (!result.success) {
      return {
        token: false,
        error: result.error.flatten(),
      };
    } else {
      // 유저 SMS 토큰 삭제
      await db.sMSToken.deleteMany({
        where: {
          user: {
            phone: result.data,
          },
        },
      });
      const token = await handleGetToken();
      await db.sMSToken.create({
        data: {
          token,
          phone: result.data,
          user: {
            connectOrCreate: {
              where: {
                phone: result.data,
              },
              create: {
                username: crypto.randomBytes(10).toString("hex"),
                phone: result.data,
              },
            },
          },
        },
      });

      await sendSMS(result.data, token);

      return {
        token: true,
        phone: result.data,
      };
    }
  } else {
    const tokenResult = await tokenSchema.safeParseAsync(token);
    const phoneResult = await phoneSchema.spa(prevState.phone);
    if (!tokenResult.success) {
      return {
        token: true,
        error: tokenResult.error.flatten(),
      };
    } else {
      const token = await db.sMSToken.findUnique({
        where: {
          token: tokenResult.data.toString(),
          user: {
            phone: phoneResult.data,
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
            formErrors: ["전화번호와 인증번호가 일치하지 않습니다."],
          },
        };
      }

      const session = await getSession();
      session.id = token!.userId;
      await session.save();
      await db.sMSToken.delete({
        where: {
          id: token!.id,
        },
      });

      // VERIFIED_SAILOR 뱃지 부여
      await checkVerifiedSailorBadge(token.userId);
      redirect("/profile");
    }
  }
};
