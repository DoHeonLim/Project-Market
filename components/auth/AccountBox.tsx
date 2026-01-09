/**
 File Name : components/auth/AccountBox
 Description : 계정 시작 링크 컴포넌트
 Author : 임도헌
 
 History
 Date        Author   Status    Description
 2025.05.30  임도헌   Created
 2025.05.30  임도헌   Modified  회원가입, 로그인 링크 추가
 */

import Link from "next/link";

export default function AccountBox() {
  return (
    <div className="mt-auto w-full max-w-md p-4 sm:p-6 z-20">
      <div className="w-full bg-white/10 dark:bg-gray-800/10 backdrop-blur-sm rounded-xl p-4 sm:p-6 shadow-lg">
        {/* 회원가입 링크 */}
        <Link
          href="/create-account"
          aria-label="보드포트에 새로운 선원으로 회원가입하기"
          className="w-full py-3 sm:py-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm 
                 text-primary dark:text-secondary rounded-lg text-center font-semibold 
                 hover:bg-white dark:hover:bg-gray-800 hover:scale-105 
                 transition-all duration-300 shadow-lg
                 flex items-center justify-center gap-2
                 text-sm sm:text-base mb-3"
        >
          <span>새로운 선원으로 등록하기</span>
          <svg
            className="w-4 h-4 sm:w-5 sm:h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 8l4 4m0 0l-4 4m4-4H3"
            />
          </svg>
        </Link>
        <div className="flex items-center justify-center gap-2 text-white dark:text-gray-200 text-sm sm:text-base">
          <span>이미 선원이신가요?</span>
          {/* 로그인 링크 */}
          <Link
            href="/login"
            className="font-semibold text-primary-light hover:text-white transition-colors"
          >
            항해 계속하기
          </Link>
        </div>
      </div>
    </div>
  );
}
