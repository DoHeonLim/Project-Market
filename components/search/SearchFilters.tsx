/**
 * File Name : components/search/SearchFilters
 * Description : 검색 필터 컴포넌트
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2024.12.17  임도헌   Created   검색 필터 컴포넌트 생성
 * 2025.04.18  임도헌   Modified  모바일일때는 고정위치, PC일때는 절대 위치로 변경
 * 2025.04.30  임도헌   Modified  성능 최적화 및 사용자 경험 개선
 * 2025.06.12  임도헌   Modified  카테고리 평탄화
 * 2025.06.18  임도헌   Modified  useSearchParamsUtils 활용해 URL 갱신 통합
 * 2025.06.18  임도헌   Modified  각 필터 컴포넌트 분리
 */
"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import type { Category } from "@prisma/client";
import { FilterState } from "@/lib/constants";
import { useSearchParamsUtils } from "@/hooks/useSearchParamsUtils";
import CategoryFilter from "./filters/CategoryFilter";
import PriceFilter from "./filters/PriceFilter";
import GameTypeFilter from "./filters/GameTypeFilter";
import ConditionFilter from "./filters/ConditionFilter";
import { useIsMobile } from "@/hooks/useIsMobile";

interface SearchFiltersProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  filters: FilterState;
}

export default function SearchFilters({
  isOpen,
  onClose,
  categories,
  filters,
}: SearchFiltersProps) {
  const { buildSearchParams } = useSearchParamsUtils();

  const [tempFilters, setTempFilters] = useState<FilterState>(filters);
  const [selectedParentCategory, setSelectedParentCategory] =
    useState<string>("");

  const wrapperRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (isMobile) return; // 모바일은 외부 클릭 무시

    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose, isMobile]);

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
    buildSearchParams(tempFilters);
    onClose();
  }, [tempFilters, buildSearchParams, onClose]);

  const handleResetFilters = useCallback(() => {
    const resetFilters: FilterState = {
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

  const parentCategories = useMemo(
    () => categories.filter((c) => c.parentId === null),
    [categories]
  );
  const childCategories = useMemo(
    () =>
      categories.filter(
        (c) => c.parentId?.toString() === selectedParentCategory
      ),
    [categories, selectedParentCategory]
  );

  return (
    <>
      {isOpen && (
        <div>
          {/* 모바일 버전 필터 UI */}
          <div className="md:hidden">
            <div className="fixed inset-0 z-50 bg-black/30">
              <div
                ref={wrapperRef}
                className="fixed top-0 left-0 right-0 bottom-0 
                        w-full h-full 
                        p-4 
                        bg-white/80 dark:bg-black
                        border border-neutral-200/20 dark:border-primary-dark/30 
                        overflow-y-auto"
              >
                <div className="space-y-4">
                  {/* 모바일 헤더 - 닫기 버튼 */}
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold dark:text-white">
                      필터
                    </h3>
                    <button
                      onClick={onClose}
                      className="p-2 text-black dark:text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
                      aria-label="필터 닫기"
                    >
                      <XMarkIcon className="size-6" />
                    </button>
                  </div>
                  {/* 카테고리 필터 */}
                  <CategoryFilter
                    parentCategories={parentCategories}
                    childCategories={childCategories}
                    selectedParentCategory={selectedParentCategory}
                    onParentChange={handleParentCategoryChange}
                    selectedChildCategory={tempFilters.category}
                    onChildChange={handleChildCategoryChange}
                  />
                  {/* 가격 범위 필터 */}
                  <PriceFilter
                    minPrice={tempFilters.minPrice}
                    maxPrice={tempFilters.maxPrice}
                    onChangeKeyValue={handlePriceChange}
                  />
                  {/* 게임 타입 필터 */}
                  <GameTypeFilter
                    value={tempFilters.game_type}
                    onChange={(value) =>
                      setTempFilters((prev) => ({
                        ...prev,
                        game_type: value,
                      }))
                    }
                  />
                  {/* 제품 상태 필터 */}
                  <ConditionFilter
                    value={tempFilters.condition}
                    onChange={(value) =>
                      setTempFilters((prev) => ({
                        ...prev,
                        condition: value,
                      }))
                    }
                  />
                  {/* 버튼 그룹 */}
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={handleResetFilters}
                      className="flex-1 px-4 py-2 text-sm text-white dark:text-white hover:text-neutral-200 dark:hover:text-gray-300 bg-rose-600 dark:bg-rose-600 hover:bg-rose-500 dark:hover:bg-rose-700 rounded"
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
              ref={wrapperRef}
              className="absolute top-0 right-0 w-72 z-50
                      bg-white dark:bg-background-dark 
                      border border-neutral-200/20 dark:border-neutral-400
                      rounded-lg shadow-lg"
            >
              <div className="p-4 space-y-4">
                {/* PC 헤더 */}
                <div className="flex justify-between items-center">
                  <h3 className="text-lg dark:text-white font-semibold">
                    필터
                  </h3>
                  <button
                    onClick={onClose}
                    className="p-2 text-black dark:text-neutral-400 hover:text-neutral-400 dark:hover:text-neutral-200"
                    aria-label="필터 닫기"
                  >
                    <XMarkIcon className="size-6" />
                  </button>
                </div>
                {/* 카테고리 필터 */}
                <CategoryFilter
                  parentCategories={parentCategories}
                  childCategories={childCategories}
                  selectedParentCategory={selectedParentCategory}
                  onParentChange={handleParentCategoryChange}
                  selectedChildCategory={tempFilters.category}
                  onChildChange={handleChildCategoryChange}
                />
                <PriceFilter
                  minPrice={tempFilters.minPrice}
                  maxPrice={tempFilters.maxPrice}
                  onChangeKeyValue={handlePriceChange}
                />
                {/* 가격 범위 필터 */}
                <GameTypeFilter
                  value={tempFilters.game_type}
                  onChange={(value) =>
                    setTempFilters((prev) => ({
                      ...prev,
                      game_type: value,
                    }))
                  }
                />
                {/* 제품 상태 필터 */}
                <ConditionFilter
                  value={tempFilters.condition}
                  onChange={(value) =>
                    setTempFilters((prev) => ({
                      ...prev,
                      condition: value,
                    }))
                  }
                />
                {/* 버튼 그룹 */}
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={handleResetFilters}
                    className="flex-1 px-4 py-2 text-sm text-white dark:text-white hover:text-neutral-200 dark:hover:text-gray-300 bg-rose-600 dark:bg-rose-600 hover:bg-rose-500 dark:hover:bg-rose-700 rounded"
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
      )}
    </>
  );
}
