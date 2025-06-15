/**
File Name : components/search/SearchSection
Description : 검색 섹션 컴포넌트
Author : 임도헌

History
Date        Author   Status    Description
2024.12.17  임도헌   Created
2024.12.17  임도헌   Modified  검색 섹션 컴포넌트 생성
2024.12.29  임도헌   Modified  검색후 섹션 컴포넌트 닫히게 변경
2025.04.29  임도헌   Modified  검색 링크 수정(기존 products에서는 search/product로 이동했음)
2025.04.29  임도헌   Modified  검색시 기존 검색 파라미터를 유지하지 않게 변경
2025.04.29  임도헌   Modified  최근 검색 기록 실시간으로 업데이트 되도록 변경
2025.04.30  임도헌   Modified  성능 최적화 및 사용자 경험 개선
2025.06.12  임도헌   Modified  카테고리 평탄화
*/
"use client";

import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import {
  FireIcon,
  ClockIcon,
  XMarkIcon,
  TrashIcon,
} from "@heroicons/react/24/solid";
import SearchBar from "./SearchBar";
import SearchFilters from "./SearchFilters";
import ProductCategoryDropdown from "./ProductCategoryDropdown";
import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  FilterState,
  GAME_TYPE_DISPLAY,
  CONDITION_DISPLAY,
} from "@/lib/constants";
import { getCategoryName } from "@/lib/category/getCategoryName";
import { useRouter } from "next/navigation";
import {
  deleteAllSearchHistory,
  deleteSearchHistory,
  getUserSearchHistory,
} from "@/app/(tabs)/products/actions/history";
import type { Category } from "@prisma/client";

interface SearchSectionProps {
  categories: Category[];
  keyword: string | undefined;
  searchParams: { [key: string]: string | undefined };
  searchHistory: {
    keyword: string;
    created_at: Date;
  }[];
  popularSearches: {
    keyword: string;
    count: number;
  }[];
  basePath: string;
}

export default function SearchSection({
  categories,
  keyword,
  searchParams,
  searchHistory,
  popularSearches,
  basePath,
}: SearchSectionProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [localSearchHistory, setLocalSearchHistory] = useState(searchHistory);
  const [filters, setFilters] = useState<FilterState>({
    category: searchParams.category ?? "",
    minPrice: searchParams.minPrice ?? "",
    maxPrice: searchParams.maxPrice ?? "",
    game_type: searchParams.game_type ?? "",
    condition: searchParams.condition ?? "",
  });
  const router = useRouter();

  useEffect(() => {
    setFilters({
      category: searchParams.category ?? "",
      minPrice: searchParams.minPrice ?? "",
      maxPrice: searchParams.maxPrice ?? "",
      game_type: searchParams.game_type ?? "",
      condition: searchParams.condition ?? "",
    });
  }, [searchParams]);

  useEffect(() => {
    setLocalSearchHistory(searchHistory);
  }, [searchHistory]);

  const handleDeleteKeyword = useCallback(async (keywordToDelete: string) => {
    try {
      await deleteSearchHistory(keywordToDelete);
      const updatedSearchHistory = await getUserSearchHistory();
      setLocalSearchHistory(updatedSearchHistory);
    } catch (error) {
      console.error("Failed to delete search history:", error);
    }
  }, []);

  const handleDeleteAllKeywords = useCallback(async () => {
    try {
      await deleteAllSearchHistory();
      setLocalSearchHistory([]);
    } catch (error) {
      console.error("Failed to delete all search history:", error);
    }
  }, []);

  const handleFilterChange = useCallback(
    (key: keyof FilterState, value: string) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const handleFilterRemove = useCallback((key: keyof FilterState) => {
    setFilters((prev) => ({ ...prev, [key]: "" }));
  }, []);

  const handleSearch = useCallback(
    async (keyword: string) => {
      const newSearchHistory = [
        { keyword, created_at: new Date() },
        ...localSearchHistory.filter((item) => item.keyword !== keyword),
      ].slice(0, 5);

      setLocalSearchHistory(newSearchHistory);

      const searchParams = new URLSearchParams({
        keyword,
        ...filters,
      });

      try {
        await deleteSearchHistory(keyword);
        router.push(`/products?${searchParams.toString()}`);
      } catch (error) {
        console.error("Failed to update search history:", error);
        router.push(`/products?${searchParams.toString()}`);
      }
    },
    [localSearchHistory, filters, router]
  );

  const filterTags = useMemo(() => {
    return Object.entries(filters).map(([key, value]) => {
      if (!value) return null;

      let displayValue = value;
      if (key === "game_type") {
        displayValue =
          GAME_TYPE_DISPLAY[value as keyof typeof GAME_TYPE_DISPLAY];
      } else if (key === "condition") {
        displayValue =
          CONDITION_DISPLAY[value as keyof typeof CONDITION_DISPLAY];
      } else if (key === "category") {
        displayValue = getCategoryName(value, categories);
      }

      return (
        <div
          key={key}
          className="flex items-center gap-1 px-3 py-1 text-sm bg-primary/10 dark:bg-primary-light/10 text-primary dark:text-primary-light rounded-full"
        >
          <span>
            {key === "minPrice" || key === "maxPrice"
              ? `가격: ${filters.minPrice ? `${filters.minPrice}원` : "0원"} ~ ${
                  filters.maxPrice ? `${filters.maxPrice}원` : "무제한"
                }`
              : `${key === "game_type" ? "게임 타입" : key === "condition" ? "상태" : "카테고리"}: ${displayValue}`}
          </span>
          <button
            onClick={() => handleFilterRemove(key as keyof FilterState)}
            className="ml-1 text-primary/70 dark:text-primary-light/70 hover:text-primary dark:hover:text-primary-light"
            aria-label={`${key} 필터 제거`}
          >
            ×
          </button>
        </div>
      );
    });
  }, [filters, categories, handleFilterRemove]);

  return (
    <div className="sticky top-0 z-10 bg-white dark:bg-neutral-900">
      {/* 상단 바 */}
      <div className="flex items-center gap-3 p-4 border-b dark:border-neutral-700">
        <ProductCategoryDropdown
          categories={categories}
          onCategorySelect={() => setIsSearchOpen(false)}
        />
        <div className="relative flex-1">
          <div
            className="w-full px-4 py-2 text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-neutral-800 rounded-xl cursor-pointer"
            onClick={() => setIsSearchOpen(true)}
          >
            <div className="flex items-center gap-2">
              <MagnifyingGlassIcon className="size-5" />
              <span>{keyword || "제품명, 설명으로 검색"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 모바일 검색 섹션 */}
      <div className="md:hidden">
        {isSearchOpen && (
          <div className="fixed inset-0 z-50 bg-white dark:bg-neutral-900">
            <div className="flex flex-col h-full">
              <div className="flex items-center gap-3 p-4 border-b dark:border-neutral-700">
                <button
                  onClick={() => setIsSearchOpen(false)}
                  className="text-gray-500 dark:text-gray-400"
                  aria-label="검색 닫기"
                >
                  <XMarkIcon className="size-6" />
                </button>
                <SearchBar
                  onSearch={(keyword) => {
                    handleSearch(keyword);
                    setIsSearchOpen(false);
                  }}
                  initialKeyword={keyword}
                  basePath={basePath}
                  autoFocus={true}
                />
                <button
                  onClick={() => setIsFilterOpen(true)}
                  className="px-4 py-2 bg-primary/10 dark:bg-primary-light/10 text-primary dark:text-primary-light border border-neutral-200/20 dark:border-primary-dark/30 rounded-lg hover:bg-primary/20 dark:hover:bg-primary-light/20 transition-colors"
                >
                  🎲 필터
                </button>
              </div>

              <div className="flex-1 overflow-y-auto">
                {Object.values(filters).some(Boolean) && (
                  <div className="flex flex-wrap gap-2 p-4 border-b dark:border-neutral-700">
                    {filterTags}
                  </div>
                )}
                {/* 검색 기록 */}
                {localSearchHistory.length > 0 && (
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="flex items-center gap-1 text-sm font-medium text-gray-500 dark:text-gray-400">
                        <ClockIcon className="size-4" />
                        최근 검색어
                      </h3>
                      <button
                        onClick={handleDeleteAllKeywords}
                        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                        aria-label="전체 검색 기록 삭제"
                      >
                        <TrashIcon className="size-4" />
                        전체 삭제
                      </button>
                    </div>
                    <div className="flex gap-4 ml-4">
                      {localSearchHistory.map((item, index) => (
                        <div key={index} className="relative group">
                          <Link
                            href={`${basePath}?keyword=${item.keyword}`}
                            className="flex items-center gap-1 text-xs text-white dark:text-gray-300"
                            onClick={() => {
                              handleSearch(item.keyword);
                              setIsSearchOpen(false);
                            }}
                          >
                            <div className="bg-neutral-500 px-2 py-1 border-1 border-neutral-600 rounded-md hover:bg-neutral-700">
                              {item.keyword}
                            </div>
                          </Link>
                          <button
                            onClick={() => handleDeleteKeyword(item.keyword)}
                            className="absolute -top-2 -right-2 size-4 bg-gray-500 text-white rounded-full flex items-center justify-center opacity-0 hover:bg-neutral-800 group-hover:opacity-100 transition-opacity"
                            aria-label={`${item.keyword} 검색 기록 삭제`}
                          >
                            <XMarkIcon className="size-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 인기 검색어 */}
                {popularSearches.length > 0 && (
                  <div className="p-4 border-t dark:border-neutral-700">
                    <h3 className="flex items-center gap-1 text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                      <FireIcon className="size-4 text-orange-500" />
                      인기 검색어
                    </h3>
                    <div className="space-y-2">
                      {popularSearches.map((item, index) => (
                        <Link
                          key={index}
                          href={`${basePath}?keyword=${item.keyword}`}
                          className="flex items-center gap-1 text-sm text-gray-700 dark:text-gray-300"
                          onClick={() => {
                            handleSearch(item.keyword);
                            setIsSearchOpen(false);
                          }}
                        >
                          <div className="w-4 ml-4">{index + 1 + "."}</div>
                          <div className="px-2 py-1 hover:bg-neutral-500 hover:text-white dark:hover:bg-neutral-700 rounded-md">
                            {item.keyword}
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* PC 검색 섹션 */}
      <div className="hidden md:block">
        {/* 적용된 필터 표시 */}
        {Object.values(filters).some(Boolean) && (
          <div className="flex flex-wrap gap-2 p-4 border-b dark:border-neutral-700">
            {filterTags}
          </div>
        )}
        {isSearchOpen && (
          <>
            {/* PC 오버레이 - 배경 클릭 시 닫기 */}
            <div
              className="fixed inset-0 bg-black/30 z-40"
              onClick={() => setIsSearchOpen(false)}
            />
            <div className="absolute inset-x-0 top-full bg-white dark:bg-neutral-900 border-b dark:border-neutral-700 shadow-lg z-50">
              <div className="p-4">
                <div className="flex gap-3">
                  <SearchBar
                    onSearch={(keyword) => {
                      handleSearch(keyword);
                      setIsSearchOpen(false);
                    }}
                    initialKeyword={keyword}
                    basePath={basePath}
                    autoFocus={true}
                  />
                  <button
                    onClick={() => setIsFilterOpen(true)}
                    className="px-4 py-2 bg-primary/10 dark:bg-primary-light/10 text-primary dark:text-primary-light border border-neutral-200/20 dark:border-primary-dark/30 rounded-lg hover:bg-primary/20 dark:hover:bg-primary-light/20 transition-colors"
                  >
                    🎲 필터
                  </button>
                </div>

                {/* 검색 기록 및 인기 검색어 */}
                <div className="mt-4 flex gap-8">
                  {/* 최근 검색어 */}
                  {localSearchHistory.length > 0 && (
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="flex items-center gap-1 text-sm font-medium text-gray-500 dark:text-gray-400">
                          <ClockIcon className="size-4" />
                          최근 검색어
                        </h3>
                        <button
                          onClick={handleDeleteAllKeywords}
                          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                          aria-label="전체 검색 기록 삭제"
                        >
                          <TrashIcon className="size-4" />
                          전체 삭제
                        </button>
                      </div>
                      <div className="flex flex-col gap-2 ml-4">
                        {localSearchHistory.map((item, index) => (
                          <div key={index} className="relative group">
                            <div className="flex items-center gap-1">
                              <Link
                                href={`${basePath}?keyword=${item.keyword}`}
                                className="text-sm text-white dark:text-gray-300"
                                onClick={() => {
                                  handleSearch(item.keyword);
                                  setIsSearchOpen(false);
                                }}
                              >
                                <div className="bg-neutral-500 px-2 py-1 border-1 border-neutral-600 rounded-md hover:bg-neutral-700">
                                  {item.keyword}
                                </div>
                              </Link>
                              <button
                                onClick={() =>
                                  handleDeleteKeyword(item.keyword)
                                }
                                className="relative -top-3 right-3 size-4 bg-gray-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-neutral-800 transition-opacity"
                                aria-label={`${item.keyword} 검색 기록 삭제`}
                              >
                                <XMarkIcon className="size-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 인기 검색어 */}
                  {popularSearches.length > 0 && (
                    <div className="flex-1">
                      <h3 className="flex items-center gap-1 text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                        <FireIcon className="size-4 text-orange-500" />
                        인기 검색어
                      </h3>
                      <div className="space-y-2">
                        {popularSearches.map((item, index) => (
                          <Link
                            key={index}
                            href={`${basePath}?keyword=${item.keyword}`}
                            className="flex items-center gap-1 text-sm text-gray-700 dark:text-gray-300"
                            onClick={() => {
                              handleSearch(item.keyword);
                              setIsSearchOpen(false);
                            }}
                          >
                            <div className="w-4 ml-4">{index + 1 + "."}</div>
                            <div className="px-2 py-1 hover:bg-neutral-500 hover:text-white dark:hover:bg-neutral-700 rounded-md">
                              {item.keyword}
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* PC 버전 닫기 버튼 */}
                <div className="mt-4 pt-4 border-t dark:border-neutral-700">
                  <button
                    onClick={() => setIsSearchOpen(false)}
                    className="w-full py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 flex items-center justify-center gap-2"
                  >
                    <XMarkIcon className="size-4" />
                    검색창 닫기
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* 필터 섹션 */}
      {isFilterOpen && (
        <div className="relative">
          <div
            className="fixed inset-0 z-40 bg-black/30 md:hidden"
            onClick={() => setIsFilterOpen(false)}
          />
          <SearchFilters
            categories={categories}
            filters={filters}
            onFilterChange={(key, value) => {
              handleFilterChange(key, value);
              setIsFilterOpen(false);
            }}
            onClose={() => setIsFilterOpen(false)}
          />
        </div>
      )}
    </div>
  );
}
