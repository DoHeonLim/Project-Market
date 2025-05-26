/**
File Name : app/(auth)/sms/page
Description : SMS 로그인 페이지
Author : 임도헌

History
Date        Author   Status    Description
2024.10.01  임도헌   Created
2024.10.01  임도헌   Modified  SMS로그인 페이지 추가
2024.10.04  임도헌   Modified  폼 제출 유효성 검증 추가
2024.10.11  임도헌   Modified  초기 state 전화번호 추가
2024.12.14  임도헌   Modified  다른 방법의 로그인 링크 추가
2024.12.24  임도헌   Modified  스타일 변경
2025.04.29  임도헌   Modified  UI 수정
*/
"use client";

import Button from "@/components/button";
import Input from "@/components/input";
import { useFormState } from "react-dom";
import { smsLogin } from "./actions";
import Link from "next/link";

const initialState = {
  token: false,
  phone: "",
  error: undefined,
};

// app/(auth)/sms/page.tsx
export default function SMSLogin() {
  const [state, action] = useFormState(smsLogin, initialState);
  return (
    <div className="flex flex-col gap-6 sm:gap-8 px-4 sm:px-6 py-6 sm:py-8 bg-background dark:bg-background-dark">
      <div className="flex flex-col gap-2 items-center">
        <h1 className="text-xl sm:text-2xl font-medium text-text dark:text-text-dark">
          🏮 등대 신호로 로그인
        </h1>
        <p className="text-base sm:text-lg text-text/80 dark:text-text-dark/80">
          📱 전화번호로 빠른 항해를 시작하세요
        </p>
      </div>
      <form action={action} className="flex flex-col gap-4 sm:gap-6">
        {state.token ? (
          <Input
            key="token"
            name="token"
            type="number"
            placeholder="등대 신호 코드(code)"
            minLength={100000}
            maxLength={999999}
            errors={state.error?.formErrors}
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
        ) : (
          <Input
            key="phone"
            name="phone"
            type="text"
            placeholder="선원 연락처(phone)"
            errors={state.error?.formErrors}
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
        )}
        <Button text={state.token ? "🔍 신호 확인" : "💫 등대 신호 보내기"} />
      </form>
      <div className="flex items-center justify-center gap-2 text-text/90 dark:text-text-dark/90 text-sm sm:text-base">
        <span>다른 방법으로 항해하실래요?</span>
        <Link
          href="/login"
          className="font-semibold text-primary hover:text-primary-dark dark:text-primary-light dark:hover:text-white transition-colors"
        >
          ✉️ 이메일로 항해하기
        </Link>
      </div>
    </div>
  );
}
