/**
 * File Name : components/auth/LoginForm
 * Description : 유저 로그인 폼 컴포넌트
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2025.05.30  임도헌   Created
 * 2025.05.30  임도헌   Modified  로그인 폼 컴포넌트로 분리
 * 2025.06.07  임도헌   Modified  toast및 router.push로 페이지 이동
 * 2025.12.09  임도헌   Modified  클라이언트 검증 모드(onBlur/onChange) 및 에러 표시 방식 개선
 * 2025.12.10  임도헌   Modified  서버 액션 결과 타입(success/fieldErrors) 반영 및 예외 처리/autoComplete 개선
 * 2025.12.12  임도헌   Modified  password 표시/숨기기 버튼을 Input(passwordToggle)로 위임하여 중복 UI 제거
 */
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";

import Input from "@/components/common/Input";
import Button from "@/components/common/Button";
import Link from "next/link";
import SocialLogin from "@/components/common/SocialLogin";
import { loginSchema, type LoginSchema } from "@/lib/auth/login/loginSchema";
import { login } from "@/app/(auth)/login/actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type FormData = LoginSchema;

export default function LoginForm({ callbackUrl }: { callbackUrl: string }) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(loginSchema),
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const onSubmit = (data: FormData) => {
    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append("email", data.email);
        formData.append("password", data.password);
        // callbackUrl은 서버에 보낼 필요 없이 클라이언트에서만 사용하거나,
        // 필요하다면 formData.append("callbackUrl", callbackUrl) 후
        // 서버에서도 sanitize해서 반환하는 형태로 확장 가능

        const result = await login(undefined, formData);

        if (!result.success) {
          const fieldErrors = result.fieldErrors as Partial<
            Record<keyof FormData, string[]>
          >;

          (Object.keys(fieldErrors) as (keyof FormData)[]).forEach((key) => {
            const message = fieldErrors[key]?.[0];
            if (message) {
              setError(key, { message });
            }
          });

          return;
        }

        toast.success("⛵ 환영합니다, 선원님!");
        router.push(callbackUrl);
      } catch {
        toast.error(
          "알 수 없는 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
        );
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
        autoComplete="email"
        errors={errors.email?.message ? [errors.email.message] : []}
      />
      <Input
        {...register("password")}
        type="password"
        passwordToggle
        placeholder="비밀 항해 코드"
        autoComplete="current-password"
        errors={errors.password?.message ? [errors.password.message] : []}
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
