/**
File Name : components/profile/UserBadges
Description : 유저가 보유한 뱃지 컴포넌트
Author : 임도헌

History
Date        Author   Status    Description
2024.12.07  임도헌   Created   
2024.12.07  임도헌   Modified  다른 유저 프로필 페이지 추가
2024.12.07  임도헌   Modified  무한 스크롤 추가
2024.12.07  임도헌   Modified  평균 평점 및 갯수 로직 수정
2024.12.12  임도헌   Modified  photo속성에서 images로 변경
2024.12.22  임도헌   Modified  제품 모델 변경에 따른 제품 타입 변경
2024.12.29  임도헌   Modified  다른 유저 프로필 컴포넌트 스타일 수정
2025.05.06  임도헌   Modified  그리드/리스트 뷰 모드 추가
*/
import Image from "next/image";
import { getBadgeKoreanName } from "@/lib/utils";

interface Badge {
  id: number;
  name: string;
  icon: string;
}

export default function UserBadges({
  badges = [],
  max = 5,
}: {
  badges?: Badge[];
  max?: number;
}) {
  if (!badges || badges.length === 0) {
    return <div className="text-gray-400">획득한 뱃지가 없습니다.</div>;
  }
  return (
    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-neutral-700">
      {badges.slice(0, max).map((badge) => (
        <div
          key={badge.id}
          className="flex flex-col items-center p-3 min-w-[80px] rounded-lg bg-primary/5 dark:bg-primary-light/5 border border-primary/30 dark:border-primary-light/30"
        >
          <div className="relative w-12 h-12 mb-2">
            <Image
              src={`${badge.icon}/public`}
              alt={getBadgeKoreanName(badge.name)}
              fill
              className="object-contain transition-opacity"
              sizes="(max-width: 48px) 100vw, 48px"
            />
          </div>
          <span className="text-xs text-center">
            {getBadgeKoreanName(badge.name)}
          </span>
        </div>
      ))}
    </div>
  );
}
