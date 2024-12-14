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
*/

"use client";

import Button from "@/components/button";
import Input from "@/components/input";
import SocialLogin from "@/components/social-login";
import { useFormState } from "react-dom";
import { login } from "./actions";
import { PASSWORD_MIN_LENGTH } from "@/lib/constants";
import Link from "next/link";

export default function Login() {
  const [state, action] = useFormState(login, null);

  return (
    <div className="flex flex-col gap-10 px-6 py-8 bg-background dark:bg-background-dark">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-medium text-text dark:text-text-dark">
          돛을 올리세요!
        </h1>
        <h2 className="text-xl font-medium text-text dark:text-text-dark">
          보드포트로 다시 항해하실 준비가 되셨나요?
        </h2>
      </div>
      <form action={action} className="flex flex-col gap-3">
        <Input
          name="email"
          type="email"
          placeholder="선원 이메일(email)"
          errors={state?.fieldErrors.email}
          required
        />
        <Input
          name="password"
          type="password"
          placeholder="비밀 항해 코드(password)"
          minLength={PASSWORD_MIN_LENGTH}
          errors={state?.fieldErrors.password}
          required
        />
        <Button text="항해 시작" />
      </form>
      <div className="flex items-center gap-2 text-text/90 dark:text-text-dark/90">
        <span>아직 선원이 아니신가요?</span>
        <Link
          href="/create-account"
          className="font-semibold text-primary-dark hover:text-primary-light dark:text-primary-light dark:hover:text-white transition-colors"
        >
          선원 등록하기
        </Link>
      </div>
      <SocialLogin />
    </div>
  );
}
