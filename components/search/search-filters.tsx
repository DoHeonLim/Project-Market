/**
File Name : components/search/search-filters.tsx
Description : 검색 필터 컴포넌트
Author : 임도헌

History
Date        Author   Status    Description
2024.12.17  임도헌   Created
2024.12.17  임도헌   Modified  검색 필터 컴포넌트 생성
2025.04.18  임도헌   Modified  모바일일때는 고정위치 PC일때는 절대 위치로 변경
*/
"use client";

import { FilterState } from "@/lib/constants";
import { useEffect, useState } from "react";

interface SearchFiltersProps {
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
  filters: FilterState;
  setFilters: (filters: FilterState) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export default function SearchFilters({
  categories,
  filters,
  setFilters,
  isOpen,
  setIsOpen,
}: SearchFiltersProps) {
  // 임시 필터 상태
  const [tempFilters, setTempFilters] = useState<FilterState>(filters);
  const [selectedParentCategory, setSelectedParentCategory] =
    useState<string>("");

  // filters prop이 변경되면 임시 필터도 업데이트
  useEffect(() => {
    setTempFilters(filters);
  }, [filters]);

  // 부모 카테고리 변경 시 처리
  const handleParentCategoryChange = (value: string) => {
    setSelectedParentCategory(value);
    setTempFilters({ ...tempFilters, category: value });
  };

  // 자식 카테고리 변경 시 처리
  const handleChildCategoryChange = (value: string) => {
    setTempFilters({ ...tempFilters, category: value });
  };

  // 필터 적용
  const handleApplyFilters = () => {
    setFilters(tempFilters);
    setIsOpen(false);
  };

  // 필터 초기화
  const handleResetFilters = () => {
    const resetFilters = {
      category: "",
      minPrice: "",
      maxPrice: "",
      game_type: "",
      condition: "",
    };
    setTempFilters(resetFilters);
    setSelectedParentCategory("");
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2 bg-primary/10 dark:bg-primary-light/10 text-primary dark:text-primary-light border border-neutral-200/20 dark:border-primary-dark/30 rounded-lg hover:bg-primary/20 dark:hover:bg-primary-light/20 transition-colors"
      >
        🎲 필터
      </button>

      {isOpen && (
        <>
          {/* 모바일 오버레이 - 배경 클릭 시 닫기 */}
          <div
            className="fixed inset-0 bg-black/30 z-40 md:hidden"
            onClick={() => setIsOpen(false)}
          />

          {/* 필터 UI - 모바일에서는 고정 위치, 데스크톱에서는 절대 위치 */}
          <div
            className="fixed md:absolute top-0 md:top-full left-0 md:left-auto right-0 md:right-0 bottom-0 md:bottom-auto 
                        w-full md:w-72 h-full md:h-auto 
                        mt-0 md:mt-2 p-4 
                        bg-white/95 dark:bg-background-dark/95 
                        border border-neutral-200/20 dark:border-primary-dark/30 
                        rounded-none md:rounded-lg 
                        shadow-lg backdrop-blur-sm
                        z-50 md:z-10
                        overflow-y-auto"
          >
            <div className="space-y-4">
              {/* 모바일 헤더 - 닫기 버튼 */}
              <div className="flex justify-between items-center md:hidden">
                <h3 className="text-lg font-semibold">필터</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              {/* 카테고리 필터 */}
              <div>
                <label className="block text-sm mb-1 dark:text-gray-300">
                  카테고리
                </label>
                <select
                  value={selectedParentCategory}
                  onChange={(e) => handleParentCategoryChange(e.target.value)}
                  className="w-full px-3 py-1 bg-white dark:bg-neutral-700 border dark:border-neutral-600 rounded"
                >
                  <option value="">전체</option>
                  {categories
                    .filter((category) => category.parentId === null)
                    .map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.icon} {category.name}
                      </option>
                    ))}
                </select>

                {selectedParentCategory && (
                  <select
                    value={tempFilters.category}
                    onChange={(e) => handleChildCategoryChange(e.target.value)}
                    className="w-full px-3 py-1 bg-white dark:bg-neutral-700 border dark:border-neutral-600 rounded mt-2"
                  >
                    <option value={selectedParentCategory}>전체</option>
                    {categories
                      .find((c) => c.id.toString() === selectedParentCategory)
                      ?.children.map((child) => (
                        <option key={child.id} value={child.id}>
                          {child.icon} {child.name}
                        </option>
                      ))}
                  </select>
                )}
              </div>

              {/* 가격 범위 필터 */}
              <div>
                <label className="block text-sm mb-1 dark:text-gray-300">
                  가격 범위
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="최소"
                    value={tempFilters.minPrice}
                    onChange={(e) =>
                      setTempFilters({
                        ...tempFilters,
                        minPrice: e.target.value,
                      })
                    }
                    className="w-full px-3 py-1 bg-white dark:bg-neutral-700 border dark:border-neutral-600 rounded"
                  />
                  <span className="text-gray-500">~</span>
                  <input
                    type="number"
                    placeholder="최대"
                    value={tempFilters.maxPrice}
                    onChange={(e) =>
                      setTempFilters({
                        ...tempFilters,
                        maxPrice: e.target.value,
                      })
                    }
                    className="w-full px-3 py-1 bg-white dark:bg-neutral-700 border dark:border-neutral-600 rounded"
                  />
                </div>
              </div>

              {/* 게임 타입 필터 */}
              <div>
                <label className="block text-sm mb-1 dark:text-gray-300">
                  게임 타입
                </label>
                <select
                  value={tempFilters.game_type}
                  onChange={(e) =>
                    setTempFilters({
                      ...tempFilters,
                      game_type: e.target.value,
                    })
                  }
                  className="w-full px-3 py-1 bg-white dark:bg-neutral-700 border dark:border-neutral-600 rounded"
                >
                  <option value="">전체</option>
                  <option value="보드게임">보드게임</option>
                  <option value="TRPG">TRPG</option>
                  <option value="카드게임">카드게임</option>
                </select>
              </div>

              {/* 제품 상태 필터 */}
              <div>
                <label className="block text-sm mb-1 dark:text-gray-300">
                  제품 상태
                </label>
                <select
                  value={tempFilters.condition}
                  onChange={(e) =>
                    setTempFilters({
                      ...tempFilters,
                      condition: e.target.value,
                    })
                  }
                  className="w-full px-3 py-1 bg-white dark:bg-neutral-700 border dark:border-neutral-600 rounded"
                >
                  <option value="">전체</option>
                  <option value="새제품급">새제품급</option>
                  <option value="거의새것">거의새것</option>
                  <option value="사용감있음">사용감있음</option>
                  <option value="많이사용됨">많이사용됨</option>
                </select>
              </div>

              {/* 버튼 그룹 */}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleResetFilters}
                  className="flex-1 py-2 text-sm text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-neutral-700 rounded hover:bg-gray-200 dark:hover:bg-neutral-600 transition-colors"
                >
                  초기화
                </button>
                <button
                  onClick={handleApplyFilters}
                  className="flex-1 py-2 text-sm text-white bg-primary hover:bg-primary/90 dark:bg-primary-light dark:hover:bg-primary-light/90 rounded transition-colors"
                >
                  적용
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
