/**
File Name : components/search/ProductCategoryDropdown.tsx
Description : 제품 카테고리 드롭다운 컴포넌트
Author : 임도헌

History
Date        Author   Status    Description
2024.12.17  임도헌   Created
2024.12.17  임도헌   Modified  제품 카테고리 드롭다운 컴포넌트 생성(카테고리 검색 기능 추가)
2025.04.18  임도헌   Modified  드롭다운 색 수정
2025.04.21  임도헌   Modified  GAME_TYPES를 SEED와 같게 변경
2025.04.29  임도헌   Modified  검색 링크 변경
2025.05.23  임도헌   Modified  카테고리 필드명 변경(name->kor_name)
*/
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { XMarkIcon } from "@heroicons/react/24/solid";

interface CategoryDropdownProps {
  categories: {
    id: number;
    kor_name: string;
    eng_name: string;
    icon: string | null;
    parentId: number | null;
    children: {
      id: number;
      kor_name: string;
      eng_name: string;
      icon: string | null;
    }[];
  }[];
  onCategorySelect?: () => void;
}

const GAME_TYPES = [
  { id: "BOARD_GAME", name: "보드게임", icon: "🎲" },
  { id: "TRPG", name: "TRPG", icon: "🎭" },
  { id: "CARD_GAME", name: "카드게임", icon: "🃏" },
];

export default function ProductCategoryDropdown({
  categories,
  onCategorySelect,
}: CategoryDropdownProps) {
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);

  const handleCategoryClick = (categoryId: number) => {
    router.push(`/products?category=${categoryId}`);
    setIsOpen(false);
    onCategorySelect?.();
  };

  const handleGameTypeClick = (gameType: string) => {
    router.push(`/products?game_type=${gameType}`);
    setIsOpen(false);
    onCategorySelect?.();
  };

  return (
    <div className="relative">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1 px-4 py-2 text-sm bg-primary dark:bg-primary-light text-white font-semibold rounded-md hover:bg-primary/90 dark:hover:bg-primary-light/90 transition-colors"
        >
          🎲 분류
        </button>
      </div>

      {isOpen && (
        <div className="absolute left-full top-0 ml-2 w-48 bg-white/95 dark:bg-background-dark/95 rounded-md shadow-lg border border-neutral-200/20 dark:border-primary-dark/30 backdrop-blur-sm z-50">
          <div className="p-2">
            <div className="relative mb-4">
              <button
                className="absolute right-0 top-0 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                onClick={() => setIsOpen(!isOpen)}
              >
                <XMarkIcon className="size-6" />
              </button>
              <h3 className="px-2 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400">
                게임 타입
              </h3>
              <div className="space-y-1">
                {GAME_TYPES.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => handleGameTypeClick(type.id)}
                    className="w-full flex items-center px-2 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-700 rounded transition-colors"
                  >
                    {type.icon} <span className="ml-2">{type.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="px-2 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400">
                카테고리
              </h3>
              <div className="space-y-1">
                {categories
                  .filter((category) => category.parentId === null)
                  .map((category) => (
                    <button
                      key={category.id}
                      onClick={() => handleCategoryClick(category.id)}
                      className="w-full flex items-center px-2 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-700 rounded transition-colors"
                    >
                      {category.icon}{" "}
                      <span className="ml-2">{category.kor_name}</span>
                    </button>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
