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
import CreateAccountForm from "@/components/auth/form/CreateAccountForm";

export default function CreateAccountPage() {
  return (
    <div className="flex flex-col gap-6 sm:gap-8 px-4 sm:px-6 py-6 sm:py-8 bg-background dark:bg-background-dark">
      <h1 className="text-xl sm:text-2xl font-medium text-text dark:text-text-dark text-center">
        🎉 새로운 선원을 환영합니다! 🎉
      </h1>
      <CreateAccountForm />
    </div>
  );
}
