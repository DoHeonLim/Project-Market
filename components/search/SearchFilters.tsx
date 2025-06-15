/**
File Name : components/search/SearchFilters
Description : 검색 필터 컴포넌트
Author : 임도헌

History
Date        Author   Status    Description
2024.12.17  임도헌   Created
2024.12.17  임도헌   Modified  검색 필터 컴포넌트 생성
2025.04.18  임도헌   Modified  모바일일때는 고정위치 PC일때는 절대 위치로 변경
2025.04.30  임도헌   Modified  성능 최적화 및 사용자 경험 개선
2025.06.12  임도헌   Modified  카테고리 평탄화
*/
"use client";

import {
  FilterState,
  GAME_TYPE_DISPLAY,
  CONDITION_DISPLAY,
} from "@/lib/constants";
import { useEffect, useState, useCallback, useMemo } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import type { Category } from "@prisma/client";

interface SearchFiltersProps {
  categories: Category[];
  filters: FilterState;
  onFilterChange: (key: keyof FilterState, value: string) => void;
  onClose: () => void;
}

export default function SearchFilters({
  categories,
  filters,
  onFilterChange,
  onClose,
}: SearchFiltersProps) {
  const [tempFilters, setTempFilters] = useState<FilterState>(filters);
  const [selectedParentCategory, setSelectedParentCategory] =
    useState<string>("");

  useEffect(() => {
    setTempFilters(filters);
  }, [filters]);

  const handleParentCategoryChange = useCallback((value: string) => {
    setSelectedParentCategory(value);
    setTempFilters((prev) => ({ ...prev, category: value }));
  }, []);

  const handleChildCategoryChange = useCallback((value: string) => {
    setTempFilters((prev) => ({ ...prev, category: value }));
  }, []);

  const handleApplyFilters = useCallback(() => {
    Object.entries(tempFilters).forEach(([key, value]) => {
      onFilterChange(key as keyof FilterState, value);
    });
    onClose();
  }, [tempFilters, onFilterChange, onClose]);

  const handleResetFilters = useCallback(() => {
    const resetFilters = {
      category: "",
      minPrice: "",
      maxPrice: "",
      game_type: "",
      condition: "",
    };
    setTempFilters(resetFilters);
    setSelectedParentCategory("");
  }, []);

  const handlePriceChange = useCallback(
    (key: "minPrice" | "maxPrice", value: string) => {
      const numValue =
        value === "" ? "" : Math.max(0, parseInt(value)).toString();
      setTempFilters((prev) => ({ ...prev, [key]: numValue }));
    },
    []
  );

  const gameTypeOptions = useMemo(() => {
    return Object.entries(GAME_TYPE_DISPLAY).map(([key, value]) => (
      <option key={key} value={key}>
        {value}
      </option>
    ));
  }, []);

  const conditionOptions = useMemo(() => {
    return Object.entries(CONDITION_DISPLAY).map(([key, value]) => (
      <option key={key} value={key}>
        {value}
      </option>
    ));
  }, []);

  const parentCategories = categories.filter((c) => c.parentId === null);
  const childCategories = categories.filter(
    (c) => c.parentId?.toString() === selectedParentCategory
  );

  return (
    <>
      {/* 모바일 버전 필터 UI */}
      <div className="md:hidden">
        <div className="fixed inset-0 z-50 bg-black/30">
          <div
            className="fixed top-0 left-0 right-0 bottom-0 
                        w-full h-full 
                        p-4 
                        bg-white/95 dark:bg-background-dark/95 
                        border border-neutral-200/20 dark:border-primary-dark/30 
                        overflow-y-auto"
          >
            <div className="space-y-4">
              {/* 모바일 헤더 - 닫기 버튼 */}
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">필터</h3>
                <button
                  onClick={onClose}
                  className="p-2 text-gray-500 hover:text-gray-700"
                  aria-label="필터 닫기"
                >
                  <XMarkIcon className="size-6" />
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
                  aria-label="부모 카테고리 선택"
                >
                  <option value="">전체</option>
                  {parentCategories.map((category) => (
                    <option key={category.id} value={category.id.toString()}>
                      {category.icon} {category.kor_name}
                    </option>
                  ))}
                </select>

                {selectedParentCategory && (
                  <select
                    value={tempFilters.category}
                    onChange={(e) => handleChildCategoryChange(e.target.value)}
                    className="w-full px-3 py-1 bg-white dark:bg-neutral-700 border dark:border-neutral-600 rounded mt-2"
                    aria-label="자식 카테고리 선택"
                  >
                    <option value={selectedParentCategory}>전체</option>
                    {childCategories.map((child) => (
                      <option key={child.id} value={child.id.toString()}>
                        {child.icon} {child.kor_name}
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
                      handlePriceChange("minPrice", e.target.value)
                    }
                    className="w-full px-3 py-1 bg-white dark:bg-neutral-700 border dark:border-neutral-600 rounded"
                    aria-label="최소 가격"
                    min="0"
                  />
                  <span className="text-gray-500">~</span>
                  <input
                    type="number"
                    placeholder="최대"
                    value={tempFilters.maxPrice}
                    onChange={(e) =>
                      handlePriceChange("maxPrice", e.target.value)
                    }
                    className="w-full px-3 py-1 bg-white dark:bg-neutral-700 border dark:border-neutral-600 rounded"
                    aria-label="최대 가격"
                    min="0"
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
                    setTempFilters((prev) => ({
                      ...prev,
                      game_type: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-1 bg-white dark:bg-neutral-700 border dark:border-neutral-600 rounded"
                  aria-label="게임 타입 선택"
                >
                  <option value="">전체</option>
                  {gameTypeOptions}
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
                    setTempFilters((prev) => ({
                      ...prev,
                      condition: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-1 bg-white dark:bg-neutral-700 border dark:border-neutral-600 rounded"
                  aria-label="제품 상태 선택"
                >
                  <option value="">전체</option>
                  {conditionOptions}
                </select>
              </div>

              {/* 버튼 그룹 */}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleResetFilters}
                  className="flex-1 px-4 py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  aria-label="필터 초기화"
                >
                  초기화
                </button>
                <button
                  onClick={handleApplyFilters}
                  className="flex-1 px-4 py-2 text-sm text-white bg-primary dark:bg-primary-light hover:bg-primary/90 dark:hover:bg-primary-light/90 rounded"
                  aria-label="필터 적용"
                >
                  적용
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PC 버전 필터 UI */}
      <div className="hidden md:block">
        <div
          className="absolute top-full right-0 mt-2 w-72 z-50
                      bg-white dark:bg-background-dark 
                      border border-neutral-200/20 dark:border-primary-dark/30 
                      rounded-lg shadow-lg"
        >
          <div className="p-4 space-y-4">
            {/* PC 헤더 */}
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">필터</h3>
              <button
                onClick={onClose}
                className="p-2 text-gray-500 hover:text-gray-700"
                aria-label="필터 닫기"
              >
                <XMarkIcon className="size-6" />
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
                aria-label="부모 카테고리 선택"
              >
                <option value="">전체</option>
                {parentCategories.map((category) => (
                  <option key={category.id} value={category.id.toString()}>
                    {category.icon} {category.kor_name}
                  </option>
                ))}
              </select>

              {selectedParentCategory && (
                <select
                  value={tempFilters.category}
                  onChange={(e) => handleChildCategoryChange(e.target.value)}
                  className="w-full px-3 py-1 bg-white dark:bg-neutral-700 border dark:border-neutral-600 rounded mt-2"
                  aria-label="자식 카테고리 선택"
                >
                  <option value={selectedParentCategory}>전체</option>
                  {childCategories.map((child) => (
                    <option key={child.id} value={child.id.toString()}>
                      {child.icon} {child.kor_name}
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
                    handlePriceChange("minPrice", e.target.value)
                  }
                  className="w-full px-3 py-1 bg-white dark:bg-neutral-700 border dark:border-neutral-600 rounded"
                  aria-label="최소 가격"
                  min="0"
                />
                <span className="text-gray-500">~</span>
                <input
                  type="number"
                  placeholder="최대"
                  value={tempFilters.maxPrice}
                  onChange={(e) =>
                    handlePriceChange("maxPrice", e.target.value)
                  }
                  className="w-full px-3 py-1 bg-white dark:bg-neutral-700 border dark:border-neutral-600 rounded"
                  aria-label="최대 가격"
                  min="0"
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
                  setTempFilters((prev) => ({
                    ...prev,
                    game_type: e.target.value,
                  }))
                }
                className="w-full px-3 py-1 bg-white dark:bg-neutral-700 border dark:border-neutral-600 rounded"
                aria-label="게임 타입 선택"
              >
                <option value="">전체</option>
                {gameTypeOptions}
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
                  setTempFilters((prev) => ({
                    ...prev,
                    condition: e.target.value,
                  }))
                }
                className="w-full px-3 py-1 bg-white dark:bg-neutral-700 border dark:border-neutral-600 rounded"
                aria-label="제품 상태 선택"
              >
                <option value="">전체</option>
                {conditionOptions}
              </select>
            </div>

            {/* 버튼 그룹 */}
            <div className="flex gap-2 pt-2">
              <button
                onClick={handleResetFilters}
                className="flex-1 px-4 py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                aria-label="필터 초기화"
              >
                초기화
              </button>
              <button
                onClick={handleApplyFilters}
                className="flex-1 px-4 py-2 text-sm text-white bg-primary dark:bg-primary-light hover:bg-primary/90 dark:hover:bg-primary-light/90 rounded"
                aria-label="필터 적용"
              >
                적용
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
