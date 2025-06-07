/**
File Name : components/auth/SmsForm
Description : 유저 SMS 로그인 폼 컴포넌트
Author : 임도헌

History
Date        Author   Status    Description
2025.05.30  임도헌   Created
2025.05.30  임도헌   Modified  SMS 로그인 폼 컴포넌트로 분리
2025.06.05  임도헌   Modified  버튼 클릭 시 아무 반응 없던 것 수정. (z.object로 감싸니 작동)
*/

// react-hook-form에 사용되는 schema가 z.object가 아닌 단일 필드라서 전체 폼 검증이 무효화됨.
// react-hook-form은 zodResolver에서 z.object({}) 구조만 허용
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";
import { sendPhoneToken, verifyPhoneToken } from "@/app/(auth)/sms/actions";
import { phoneSchema, tokenSchema } from "@/lib/auth/sms/smsSchema";
import { z } from "zod";

type Phase = "phone" | "token";
type FormValues = { phone?: string; token?: string };

export default function SmsForm() {
  const [phase, setPhase] = useState<Phase>("phone");
  const [phone, setPhone] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const schema = z.object(
    phase === "phone" ? { phone: phoneSchema } : { token: tokenSchema }
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: FormValues) => {
    setFormError(null);
    startTransition(async () => {
      if (phase === "phone" && data.phone) {
        const formData = new FormData();
        formData.append("phone", data.phone);
        const res = await sendPhoneToken(formData);
        if (res?.error) {
          setFormError(res.error);
        } else {
          setPhone(data.phone);
          setPhase("token");
          reset();
        }
      }

      if (phase === "token" && data.token && phone) {
        const formData = new FormData();
        formData.append("token", data.token);
        formData.append("phone", phone);
        const res = await verifyPhoneToken(formData);
        if (res?.error) {
          setFormError(res.error);
        }
      }
    });
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-4 sm:gap-6"
    >
      {phase === "phone" ? (
        <Input
          {...register("phone")}
          type="text"
          placeholder="선원 연락처(phone)"
          errors={[errors.phone?.message ?? formError ?? ""]}
          required
          icon={
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
              />
            </svg>
          }
        />
      ) : (
        <Input
          {...register("token")}
          type="number"
          placeholder="등대 신호 코드(code)"
          min={100000}
          max={999999}
          errors={[errors.token?.message ?? formError ?? ""]}
          required
          icon={
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
          }
        />
      )}
      <Button
        text={phase === "phone" ? "💫 등대 신호 보내기" : "🔍 신호 확인"}
        disabled={isPending}
      />
    </form>
  );
}
