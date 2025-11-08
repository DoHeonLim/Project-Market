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

import LoginForm from "@/components/auth/form/LoginForm";

export default function LoginPage({
  searchParams,
}: {
  searchParams?: { callbackUrl?: string };
}) {
  const callbackUrl = searchParams?.callbackUrl ?? "/profile"; // 기본값
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
      <LoginForm callbackUrl={callbackUrl} />
    </div>
  );
}
