/**
File Name : app/(auth)/page
Description : 메인 페이지
Author : 임도헌

History
Date        Author   Status    Description
2024.10.01  임도헌   Created
2024.10.01  임도헌   Modified  메인 페이지 추가
2024.12.12  임도헌   Modified  다크모드 적용, 디자인 변경
2024.12.14  임도헌   Modified  스타일 변경
2024.12.24  임도헌   Modified  스타일 재변경
*/

import Logo from "@/components/logo";
import Link from "next/link";

export default function Login() {
  return (
    <div
      className="flex flex-col items-center justify-between min-h-screen 
                    bg-gradient-to-b from-secondary via-primary to-primary-dark 
                    dark:from-secondary-dark dark:via-primary-dark dark:to-primary 
                    overflow-hidden relative"
    >
      {/* 별(밤하늘) 효과 - 다크모드에서만 표시 */}
      <div className="stars hidden dark:block">
        {[...Array(20)].map((_, i) => (
          <div key={i} className={`star star${i + 1}`} />
        ))}
      </div>

      {/* 구름 애니메이션 - 라이트모드에서는 하얀색, 다크모드에서는 어두운색 */}
      <div className="clouds">
        <div className="cloud cloud1 bg-white/80 dark:bg-gray-800/50"></div>
        <div className="cloud cloud2 bg-white/80 dark:bg-gray-800/50"></div>
        <div className="cloud cloud3 bg-white/80 dark:bg-gray-800/50"></div>
      </div>

      {/* 갈매기 애니메이션 */}
      <div className="seagulls">
        <div className="seagull seagull1"></div>
        <div className="seagull seagull2"></div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="my-auto flex flex-col items-center gap-4 z-10 animate-fade-in">
        <Logo variant="full" size={256} />
        <div className="text-center text-white dark:text-gray-200 mt-2 drop-shadow-md space-y-2">
          <p className="text-lg">
            보드게임과 TRPG의 새로운 항구,
            <br />
            보드포트에서 당신의 항해를 시작하세요
          </p>
        </div>
      </div>

      {/* 버튼 영역 */}
      <div className="flex flex-col items-center w-full max-w-md gap-3 p-6 z-20 relative bottom-16">
        <Link
          href="/create-account"
          className="w-full py-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm 
                   text-primary dark:text-secondary rounded-lg text-center font-semibold 
                   hover:bg-white dark:hover:bg-gray-800 hover:scale-105 
                   transition-all duration-300 shadow-lg
                   flex items-center justify-center gap-2"
        >
          <span>새로운 선원으로 등록하기</span>
          <svg
            className="w-5 h-5"
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
        <div className="flex gap-2 text-white/90">
          <span>이미 선원이신가요?</span>
          <Link
            href="/login"
            className="font-semibold text-primary-light hover:text-white transition-colors"
          >
            항해 계속하기
          </Link>
        </div>
      </div>

      {/* 파도 애니메이션 */}
      <div className="absolute bottom-0 left-0 right-0 z-10 wave-container">
        <div className="wave wave1"></div>
        <div className="wave wave2"></div>
        <div className="wave wave3"></div>
      </div>
    </div>
  );
}
