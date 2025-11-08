/**
File Name : components/auth/LoginForm
Description : 유저 로그인 폼 컴포넌트
Author : 임도헌

History
Date        Author   Status    Description
2025.05.30  임도헌   Created
2025.05.30  임도헌   Modified  로그인 폼 컴포넌트로 분리
2025.06.07  임도헌   Modified  toast및 router.push로 페이지 이동
*/
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import type { z } from "zod";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";
import Link from "next/link";
import SocialLogin from "@/components/common/SocialLogin";
import { loginSchema } from "@/lib/auth/login/loginSchema";
import { login } from "@/app/(auth)/login/actions";
import { toast } from "sonner";

type FormData = z.infer<typeof loginSchema>;

export default function LoginForm({ callbackUrl }: { callbackUrl: string }) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(loginSchema) });

  const [isPending, startTransition] = useTransition();

  const onSubmit = (data: FormData) => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append("email", data.email);
      formData.append("password", data.password);
      formData.append("callbackUrl", callbackUrl); // ★ 중요

      const result = await login(undefined, formData);
      if (result?.fieldErrors) {
        const fieldErrors = result.fieldErrors as Partial<
          Record<keyof FormData, string[]>
        >;
        (Object.keys(fieldErrors) as (keyof FormData)[]).forEach((key) => {
          const message = fieldErrors[key]?.[0];
          if (message) setError(key, { message });
        });
      } else {
        toast.success("⛵ 환영합니다, 선원님!");
        // 서버 액션에서 redirect가 발생하므로 여기서는 추가 이동 불필요
      }
    });
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-4 sm:gap-6"
    >
      <Input
        {...register("email")}
        type="email"
        placeholder="선원 이메일"
        errors={[errors.email?.message ?? ""]}
      />
      <Input
        {...register("password")}
        type="password"
        placeholder="비밀 항해 코드"
        errors={[errors.password?.message ?? ""]}
      />
      <Button
        text={isPending ? "시작 중..." : "⛵ 항해 시작하기"}
        disabled={isPending}
      />
      <div className="text-center text-sm sm:text-base text-text dark:text-text-dark">
        <span>아직 선원이 아니신가요? </span>
        <Link
          href="/create-account"
          className="text-primary font-semibold hover:underline"
        >
          🎯 새로운 선원 등록
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
