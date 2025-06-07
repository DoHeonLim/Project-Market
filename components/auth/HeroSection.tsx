/**
 File Name : components\auth\HeroSection
 Description : 메인 콘텐츠 컴포넌트
 Author : 임도헌
 
 History
 Date        Author   Status    Description
 2025.05.30  임도헌   Created
 2025.05.30  임도헌   Modified  인트로 문구, 로고 추가
 */

import Logo from "../common/Logo";

export default function HeroSection() {
  return (
    <div className="my-auto flex flex-col items-center gap-4 z-10 animate-fade-in px-4">
      <Logo
        variant="full"
        size={256}
        className="w-48 h-48 sm:w-64 sm:h-64 md:w-72 md:h-72 lg:w-80 lg:h-80"
      />
      <div className="text-center text-white dark:text-gray-200 mt-2 drop-shadow-md space-y-2">
        <p className="text-base sm:text-lg md:text-xl">
          보드게임과 TRPG의 새로운 항구,
          <br />
          보드포트에서 당신의 항해를 시작하세요
        </p>
      </div>
    </div>
  );
}
