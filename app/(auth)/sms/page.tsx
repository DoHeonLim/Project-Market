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
    <div className="flex flex-col gap-10 px-6 py-8 bg-background dark:bg-background-dark">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-medium text-text dark:text-text-dark">
          등대 신호로 로그인
        </h1>
        <h2 className="text-xl font-medium text-text dark:text-text-dark">
          전화번호로 빠른 항해를 시작하세요
        </h2>
      </div>
      <form action={action} className="flex flex-col gap-3">
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
          />
        ) : (
          <Input
            key="phone"
            name="phone"
            type="text"
            placeholder="선원 연락처(phone)"
            errors={state.error?.formErrors}
            required
          />
        )}
        <Button text={state.token ? "신호 확인" : "등대 신호 보내기"} />
      </form>
      <div className="flex gap-2 text-text/90 dark:text-text-dark/90">
        <span>다른 방법으로 항해하실래요?</span>
        <Link
          href="/login"
          className="font-semibold text-primary-light hover:text-white hover:underline transition-colors"
        >
          이메일로 항해하기
        </Link>
      </div>
    </div>
  );
}
