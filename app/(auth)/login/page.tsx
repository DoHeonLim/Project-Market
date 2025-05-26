/**
File Name : app/(auth)/login/page
Description : 로그인 페이지
Author : 임도헌

History
Date        Author   Status    Description
2024.10.01  임도헌   Created
2024.10.01  임도헌   Modified  로그인 페이지 추가
2024.10.04  임도헌   Modified  폼 제출 유효성 검증 추가
2024.12.14  임도헌   Modified  다른 방법의 로그인 링크 추가
2024.12.24  임도헌   Modified  스타일 변경
2025.04.29  임도헌   Modified  UI 수정
*/

"use client";

import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import SocialLogin from "@/components/common/SocialLogin";
import { useFormState } from "react-dom";
import { login } from "./actions";
import { PASSWORD_MIN_LENGTH } from "@/lib/constants";
import Link from "next/link";

export default function Login() {
  const [state, action] = useFormState(login, null);

  return (
    <div className="flex flex-col gap-6 sm:gap-8 px-4 sm:px-6 py-6 sm:py-8 bg-gradient-to-b from-background to-background/95 dark:from-background-dark dark:to-background-dark/95">
      <div className="flex flex-col gap-2 items-center">
        <h1 className="text-xl sm:text-2xl font-medium text-text dark:text-text-dark">
          ⚓ 항해 준비
        </h1>
        <p className="text-base sm:text-lg text-text/80 dark:text-text-dark/80">
          보드포트의 바다로 돌아오신 것을 환영합니다
        </p>
      </div>
      <form action={action} className="flex flex-col gap-4 sm:gap-6">
        <Input
          name="email"
          type="email"
          placeholder="선원 이메일"
          errors={state?.fieldErrors.email}
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
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          }
        />
        <Input
          name="password"
          type="password"
          placeholder="비밀 항해 코드"
          minLength={PASSWORD_MIN_LENGTH}
          errors={state?.fieldErrors.password}
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
                d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
              />
            </svg>
          }
        />
        <Button text="⛵ 항해 시작하기" />
      </form>
      <div className="flex items-center justify-center gap-2 text-text/90 dark:text-text-dark/90 text-sm sm:text-base">
        <span>아직 선원이 아니신가요?</span>
        <Link
          href="/create-account"
          className="font-semibold text-primary hover:text-primary-dark dark:text-primary-light dark:hover:text-white transition-colors"
        >
          🎯 새로운 선원 등록
        </Link>
      </div>
      <div className="space-y-4 sm:space-y-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-text/10 dark:border-text-dark/10"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-background dark:bg-background-dark text-text/50 dark:text-text-dark/50">
              🌊 다른 방법으로 승선하기
            </span>
          </div>
        </div>
        <SocialLogin />
      </div>
    </div>
  );
}
