/**
File Name : app/sms/page
Description : SMS 로그인 페이지
Author : 임도헌

History
Date        Author   Status    Description
2024.10.01  임도헌   Created
2024.10.01  임도헌   Modified  SMS로그인 페이지 추가
2024.10.04  임도헌   Modified  폼 제출 유효성 검증 추가
2024.10.11  임도헌   Modified  초기 state 전화번호 추가
*/
"use client";

import Button from "@/components/button";
import Input from "@/components/input";
import { useFormState } from "react-dom";
import { smsLogin } from "./actions";

const initialState = {
  token: false,
  phone: "",
  error: undefined,
};

export default function SMSLogin() {
  const [state, action] = useFormState(smsLogin, initialState);
  return (
    <div className="flex flex-col gap-10 px-6 py-8">
      <div className="flex flex-col gap-2 *:font-medium">
        <h1 className="text-2xl ">SMS 로그인</h1>
        <h2 className="text-xl">전화번호 인증</h2>
      </div>
      <form action={action} className="flex flex-col gap-3">
        {state.token ? (
          <Input
            key="token"
            name="token"
            type="number"
            placeholder="인증번호"
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
            placeholder="전화번호"
            errors={state.error?.formErrors}
            required
          />
        )}
        <Button text={state.token ? "인증" : "SMS 전송"} />
      </form>
    </div>
  );
}
