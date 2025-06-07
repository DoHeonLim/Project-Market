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
import SmsForm from "@/components/auth/form/SmsForm";
import Link from "next/link";

export default function SMSLoginPage() {
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
      <SmsForm />
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
