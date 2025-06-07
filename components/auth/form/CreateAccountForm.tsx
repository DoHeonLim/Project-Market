/**
File Name : components/auth/CreateAccountForm
Description : 유저 회원가입 폼 컴포넌트
Author : 임도헌

History
Date        Author   Status    Description
2025.05.30  임도헌   Created
2025.05.30  임도헌   Modified  회원가입 폼 컴포넌트로 분리

*/

"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import { submitCreateAccount } from "@/app/(auth)/create-account/actions";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";
import { PASSWORD_MIN_LENGTH } from "@/lib/constants";
import Link from "next/link";
import SocialLogin from "@/components/common/SocialLogin";
import { createAccountSchema } from "@/lib/auth/create-account/createAccountSchema";
import { z } from "zod";

type FormData = z.infer<typeof createAccountSchema>;

export default function CreateAccountForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<FormData>({
    resolver: zodResolver(createAccountSchema),
  });

  const [isPending, startTransition] = useTransition();

  const onSubmit = (data: FormData) => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append("username", data.username);
      formData.append("email", data.email);
      formData.append("password", data.password);
      formData.append("confirmPassword", data.confirmPassword);

      const result = await submitCreateAccount(null, formData);

      if (result?.fieldErrors) {
        const fieldErrors = result.fieldErrors as Partial<
          Record<keyof FormData, string[]>
        >;
        (Object.keys(fieldErrors) as (keyof FormData)[]).forEach((key) => {
          const message = fieldErrors[key]?.[0];
          if (message) {
            setError(key, { message });
          }
        });
      }
    });
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-4 sm:gap-6"
    >
      <Input
        {...register("username")}
        placeholder="선원 닉네임(nickname)"
        errors={[errors.username?.message ?? ""]}
        minLength={3}
        maxLength={10}
      />
      <Input
        {...register("email")}
        type="email"
        placeholder="선원 이메일(email)"
        errors={[errors.email?.message ?? ""]}
      />
      <Input
        {...register("password")}
        type="password"
        placeholder="비밀 항해 코드(password)"
        minLength={PASSWORD_MIN_LENGTH}
        errors={[errors.password?.message ?? ""]}
      />
      <Input
        {...register("confirmPassword")}
        type="password"
        placeholder="비밀 항해 코드 확인(confirmPassword)"
        minLength={PASSWORD_MIN_LENGTH}
        errors={[errors.confirmPassword?.message ?? ""]}
      />
      <Button
        text={isPending ? "등록 중..." : "선원 등록 하기"}
        disabled={isPending}
      />
      <div className="text-center text-sm sm:text-base text-text dark:text-text-dark">
        <span>이미 선원이신가요? </span>
        <Link
          href="/login"
          className="text-primary font-semibold hover:underline"
        >
          ⛵ 항해 시작하기
        </Link>
      </div>
      <div className="relative pt-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-text/10 dark:border-text-dark/10" />
        </div>
        <div className="relative text-center text-sm">
          <span className="px-2 bg-background dark:bg-background-dark text-text/50 dark:text-text-dark/50">
            🌊 다른 방법으로 승선하기
          </span>
        </div>
      </div>
      <SocialLogin />
    </form>
  );
}
