/**
File Name : app/(auth)/create-account/page
Description : 회원가입 페이지
Author : 임도헌

History
Date        Author   Status    Description
2024.10.01  임도헌   Created
2024.10.01  임도헌   Modified  회원가입 페이지 추가
2024.10.04  임도헌   Modified  폼 제출 유효성 검증 추가
2024.12.14  임도헌   Modified  다른 방법의 로그인 링크 추가
2025.04.29  임도헌   Modified  UI 수정
*/
"use client";

import SocialLogin from "@/components/social-login";
import { useFormState } from "react-dom";
import { createAccount } from "./actions";
import Input from "@/components/input";
import Button from "@/components/button";
import { PASSWORD_MIN_LENGTH } from "@/lib/constants";
import Link from "next/link";

// app/(auth)/create-account/page.tsx
export default function CreateAccount() {
  const [state, action] = useFormState(createAccount, null);
  return (
    <div className="flex flex-col gap-6 sm:gap-8 px-4 sm:px-6 py-6 sm:py-8 bg-background dark:bg-background-dark">
      <div className="flex flex-col gap-2 items-center">
        <h1 className="text-xl sm:text-2xl font-medium text-text dark:text-text-dark">
          🎉새로운 선원을 환영합니다!🎉
        </h1>
      </div>
      <form action={action} className="flex flex-col gap-4 sm:gap-6">
        <Input
          name="username"
          type="text"
          placeholder="선원 닉네임(nickname)"
          required
          errors={state?.fieldErrors.username}
          minLength={3}
          maxLength={10}
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
                d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          }
        />
        <Input
          name="email"
          type="email"
          placeholder="선원 이메일(email)"
          required
          errors={state?.fieldErrors.email}
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
          placeholder="비밀 항해 코드(password)"
          minLength={PASSWORD_MIN_LENGTH}
          required
          errors={state?.fieldErrors.password}
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
        <Input
          name="confirmPassword"
          type="password"
          placeholder="비밀 항해 코드 확인(confirmPassword)"
          minLength={PASSWORD_MIN_LENGTH}
          required
          errors={state?.fieldErrors.confirmPassword}
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
        <Button text="선원 등록 완료" />
      </form>
      <div className="flex items-center justify-center gap-2 text-text/90 dark:text-text-dark/90 text-sm sm:text-base">
        <span>이미 선원이신가요?</span>
        <Link
          href="/login"
          className="font-semibold text-primary hover:text-primary-dark dark:text-primary-light dark:hover:text-white transition-colors"
        >
          ⛵ 항해 시작하기
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
