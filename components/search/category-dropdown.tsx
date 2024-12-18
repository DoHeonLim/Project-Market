/**
File Name : components/search/category-dropdown.tsx
Description : 카테고리 드롭다운 컴포넌트
Author : 임도헌

History
Date        Author   Status    Description
2024.12.17  임도헌   Created
2024.12.17  임도헌   Modified  카테고리 드롭다운 컴포넌트 생성(카테고리 검색 기능 추가)
*/
"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { ChevronLeftIcon, XMarkIcon } from "@heroicons/react/24/solid";

interface CategoryDropdownProps {
  categories: {
    id: number;
    name: string;
    icon: string | null;
    parentId: number | null;
    children: {
      id: number;
      name: string;
      icon: string | null;
    }[];
  }[];
}

const GAME_TYPES = [
  { id: "board", name: "보드게임", icon: "🎲" },
  { id: "trpg", name: "TRPG", icon: "🎭" },
  { id: "card", name: "카드게임", icon: "🃏" },
];

export default function CategoryDropdown({
  categories,
}: CategoryDropdownProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const handleCategoryClick = (categoryId: number) => {
    router.push(`/search/products?category=${categoryId}`);
    setIsOpen(false);
  };

  const handleGameTypeClick = (gameType: string) => {
    router.push(`/search/products?game_type=${gameType}`);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <div className="flex items-center justify-between">
        {pathname !== "/products" && (
          <button onClick={() => router.push("/products")}>
            <ChevronLeftIcon className="w-10 h-10 text-semibold" />
          </button>
        )}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1 px-4 py-2 text-sm bg-primary text-white font-semibold dark:text-gray-300 hover:bg-primary-light dark:hover:bg-primary-dark rounded-md transition-colors"
        >
          분류
        </button>
      </div>

      {isOpen && (
        <div className="absolute left-full top-0 ml-2 w-48 bg-white dark:bg-neutral-800 rounded-md shadow-lg border dark:border-neutral-700 z-50">
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
                    onClick={() => handleGameTypeClick(type.name)}
                    className="w-full flex items-center px-2 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-700 rounded"
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
                      className="w-full flex items-center px-2 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-700 rounded"
                    >
                      {category.icon}{" "}
                      <span className="ml-2">{category.name}</span>
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
