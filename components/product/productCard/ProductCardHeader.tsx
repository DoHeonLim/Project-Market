/**
 * File Name : components/product/ProductCardHeader
 * Description : 게임 타입 및 카테고리 정보를 표시하는 컴포넌트
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2025.06.07  임도헌   Created   게임 타입 및 카테고리 정보 분리 컴포넌트
 */

interface ProductCardHeaderProps {
  gameType: string;
  category: {
    eng_name: string;
    kor_name: string;
    icon: string | null;
    parent?: {
      eng_name: string;
      kor_name: string;
      icon: string | null;
    } | null;
  };
}

import { GAME_TYPE_DISPLAY } from "@/lib/constants";

export function ProductCardHeader({
  gameType,
  category,
}: ProductCardHeaderProps) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="text-xs sm:text-sm text-primary dark:text-primary-light font-medium">
        🎲 {GAME_TYPE_DISPLAY[gameType as keyof typeof GAME_TYPE_DISPLAY]}
      </span>
      {category && (
        <>
          <span className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
            |
          </span>
          <span className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 line-clamp-1">
            {category.parent?.icon} {category.parent?.kor_name} &gt;{" "}
            {category.icon} {category.kor_name}
          </span>
        </>
      )}
    </div>
  );
}
