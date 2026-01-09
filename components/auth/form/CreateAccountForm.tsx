/**
 * File Name : components/auth/CreateAccountForm
 * Description : 유저 회원가입 폼 컴포넌트
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2025.05.30  임도헌   Created
 * 2025.05.30  임도헌   Modified  회원가입 폼 컴포넌트로 분리
 * 2025.06.07  임도헌   Modified  toast및 router.push로 페이지 이동
 * 2025.12.09  임도헌   Modified  클라이언트 검증 모드(onBlur/onChange) 및 에러 메시지 표시 방식 개선
 * 2025.12.10  임도헌   Modified  서버 액션 결과 처리 방식 통일, 예외 토스트 추가 및 autoComplete/에러 전달 로직 개선
 * 2025.12.12  임도헌   Modified  password 표시/숨기기 버튼을 Input(passwordToggle)로 위임하여 중복 UI 제거
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
import {
  createAccountSchema,
  type CreateAccountSchema,
} from "@/lib/auth/create-account/createAccountSchema";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type FormData = CreateAccountSchema;

export default function CreateAccountForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<FormData>({
    resolver: zodResolver(createAccountSchema),
    mode: "onBlur", // 처음 에러는 blur 시점에
    reValidateMode: "onChange", // 한번 에러난 필드는 타이핑하면 바로 재검증
  });

  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const onSubmit = (data: FormData) => {
    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append("username", data.username);
        formData.append("email", data.email);
        formData.append("password", data.password);
        formData.append("confirmPassword", data.confirmPassword);

        const result = await submitCreateAccount(null, formData);

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

        toast.success("🪪 선원 등록 완료! 이제 당신의 항해를 시작해보세요.");
        router.push("/profile");
      } catch {
        // 네트워크/서버 예외 발생 시
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
        {...register("username")}
        placeholder="선원 닉네임(nickname)"
        autoComplete="username"
        errors={errors.username?.message ? [errors.username.message] : []}
      />
      <Input
        {...register("email")}
        type="email"
        placeholder="선원 이메일(email)"
        autoComplete="email"
        errors={errors.email?.message ? [errors.email.message] : []}
      />
      <Input
        {...register("password")}
        type="password"
        passwordToggle
        placeholder="비밀 항해 코드(password)"
        minLength={PASSWORD_MIN_LENGTH}
        autoComplete="new-password"
        errors={errors.password?.message ? [errors.password.message] : []}
      />

      <Input
        {...register("confirmPassword")}
        type="password"
        passwordToggle
        placeholder="비밀 항해 코드 확인(confirmPassword)"
        minLength={PASSWORD_MIN_LENGTH}
        autoComplete="new-password"
        errors={
          errors.confirmPassword?.message
            ? [errors.confirmPassword.message]
            : []
        }
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
