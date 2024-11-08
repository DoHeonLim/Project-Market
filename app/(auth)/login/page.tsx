/**
File Name : app/(auth)/login/page
Description : 로그인 페이지
Author : 임도헌

History
Date        Author   Status    Description
2024.10.01  임도헌   Created
2024.10.01  임도헌   Modified  로그인 페이지 추가
2024.10.04  임도헌   Modified  폼 제출 유효성 검증 추가
*/

"use client";

import Button from "@/components/button";
import Input from "@/components/input";
import SocialLogin from "@/components/social-login";
import { useFormState } from "react-dom";
import { login } from "./actions";
import { PASSWORD_MIN_LENGTH } from "@/lib/constants";

export default function Login() {
  const [state, action] = useFormState(login, null);

  return (
    <div className="flex flex-col gap-10 px-6 py-8">
      <div className="flex flex-col gap-2 *:font-medium">
        <h1 className="text-2xl ">안녕하세요!</h1>
        <h2 className="text-xl">이메일로 로그인 하세요!</h2>
      </div>
      <form action={action} className="flex flex-col gap-3">
        <Input
          name="email"
          type="email"
          placeholder="이메일"
          errors={state?.fieldErrors.email}
          required
        />
        <Input
          name="password"
          type="password"
          placeholder="비밀번호"
          minLength={PASSWORD_MIN_LENGTH}
          errors={state?.fieldErrors.password}
          required
        />
        <Button text="로그인" />
      </form>

      <SocialLogin />
    </div>
  );
}
