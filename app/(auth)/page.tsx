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
2025.04.29  임도헌   Modified  UI 수정
2025.05.30  임도헌   Modified  background 관련 컴포넌트 분리(Stars, Clouds, Seagulls, Waves)
2025.05.30  임도헌   Modified  메인 콘텐츠, 버튼 영역 컴포넌트로 분리
*/

import AccountBox from "@/components/auth/AccountBox";
import Clouds from "@/components/auth/background/Clouds";
import Seagulls from "@/components/auth/background/Seagulls";
import Stars from "@/components/auth/background/Stars";
import Waves from "@/components/auth/background/Waves";
import HeroSection from "@/components/auth/HeroSection";

export default function Login() {
  return (
    <div
      className="flex flex-col items-center justify-between min-h-screen 
                    bg-gradient-to-b from-secondary via-primary to-primary-dark 
                    dark:from-secondary-dark dark:via-primary-dark dark:to-primary 
                    overflow-hidden relative"
    >
      {/* 별(밤하늘) 효과 - 다크모드에서만 표시 */}
      <Stars />

      {/* 구름 애니메이션 - 라이트모드에서는 하얀색, 다크모드에서는 어두운색 */}
      <Clouds />

      {/* 갈매기 애니메이션 */}
      <Seagulls />

      {/* 메인 콘텐츠 */}
      <HeroSection />

      {/* 버튼 영역 */}
      <AccountBox />

      {/* 파도 애니메이션 */}
      <Waves />
    </div>
  );
}
