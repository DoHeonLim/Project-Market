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
    <div className="flex flex-col gap-10 px-6 py-8 bg-background dark:bg-background-dark">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-medium text-text dark:text-text-dark">
          새로운 선원을 환영합니다!
        </h1>
        <h2 className="text-xl font-medium text-text dark:text-text-dark">
          보드포트의 항해 일지를 작성해주세요!
        </h2>
      </div>
      <form action={action} className="flex flex-col gap-3">
        <Input
          name="username"
          type="text"
          placeholder="선원 닉네임(nickname)"
          required
          errors={state?.fieldErrors.username}
          minLength={3}
          maxLength={10}
        />
        <Input
          name="email"
          type="email"
          placeholder="선원 이메일(email)"
          required
          errors={state?.fieldErrors.email}
        />
        <Input
          name="password"
          type="password"
          placeholder="비밀 항해 코드(password)"
          minLength={PASSWORD_MIN_LENGTH}
          required
          errors={state?.fieldErrors.password}
        />
        <Input
          name="confirmPassword"
          type="password"
          placeholder="비밀 항해 코드 확인(confirmPassword)"
          minLength={PASSWORD_MIN_LENGTH}
          required
          errors={state?.fieldErrors.confirmPassword}
        />
        <Button text="선원 등록 완료" />
      </form>
      <div className="flex items-center gap-2 text-text/90 dark:text-text-dark/90">
        <span>이미 선원이신가요?</span>
        <Link
          href="/login"
          className="font-semibold text-primary-dark hover:text-primary-light dark:text-primary-light dark:hover:text-white transition-colors"
        >
          항해 시작하기
        </Link>
      </div>
      <SocialLogin />
    </div>
  );
}
