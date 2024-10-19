/**
File Name : app/(auth)/page
Description : 메인 페이지
Author : 임도헌

History
Date        Author   Status    Description
2024.10.01  임도헌   Created
2024.10.01  임도헌   Modified  메인 페이지 추가
*/

import Link from "next/link";

export default function Login() {
  return (
    <div className="flex flex-col items-center justify-between min-h-screen p-6">
      <div className="my-auto flex flex-col items-center gap-2 *:font-medium">
        <span className="text-9xl">🫧</span>
        <h1 className="text-4xl">버블</h1>
        <h2 className="text-2xl">버블 마켓에 어서오세요!</h2>
      </div>
      <div className="flex flex-col items-center w-full gap-3">
        <Link href="/create-account" className="primary-btn text-lg py-2.5">
          시작하기
        </Link>
        <div className="flex gap-2">
          <span>이미 계정이 있나요?</span>
          <Link href="/login" className="hover:underline">
            로그인
          </Link>
        </div>
      </div>
    </div>
  );
}