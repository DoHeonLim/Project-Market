/**
File Name : components/search/search-section.tsx
Description : 검색 섹션 컴포넌트
Author : 임도헌

History
Date        Author   Status    Description
2024.12.17  임도헌   Created
2024.12.17  임도헌   Modified  검색 섹션 컴포넌트 생성
2024.12.29  임도헌   Modified  검색후 섹션 컴포넌트 닫히게 변경
*/
"use client";

import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import {
  FireIcon,
  ClockIcon,
  XMarkIcon,
  TrashIcon,
} from "@heroicons/react/24/solid";
import SearchBar from "./search-bar";
import SearchFilters from "./search-filters";
import ProductCategoryDropdown from "./product-category-dropdown";
import { useState } from "react";
import Link from "next/link";
import {
  deleteSearchHistory,
  deleteAllSearchHistory,
} from "@/app/search/products/actions";
import { FilterState } from "@/lib/constants";

interface SearchSectionProps {
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

  const handleDeleteKeyword = async (keywordToDelete: string) => {
    await deleteSearchHistory(keywordToDelete);
    setLocalSearchHistory((prev) =>
      prev.filter((item) => item.keyword !== keywordToDelete)
    );
  };

  const handleDeleteAllKeywords = async () => {
    await deleteAllSearchHistory();
    setLocalSearchHistory([]);
  };

  return (
    <div className="sticky top-0 z-10 bg-white dark:bg-neutral-900">
      {/* 상단 바 */}
      <div className="flex items-center gap-3 p-4 border-b dark:border-neutral-700">
        <ProductCategoryDropdown categories={categories} />
        <div className="relative flex-1" onClick={() => setIsSearchOpen(true)}>
          <div className="w-full px-4 py-2 text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-neutral-800 rounded-xl cursor-pointer">
            <div className="flex items-center gap-2">
              <MagnifyingGlassIcon className="size-5" />
              <span>{keyword || "제품명, 설명으로 검색"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 검색 드롭다운 */}
      {isSearchOpen && (
        <div className="absolute inset-x-0 top-full bg-white dark:bg-neutral-900 border-b dark:border-neutral-700 shadow-lg">
          <div className="p-4">
            <div className="flex gap-3">
              <SearchBar
                basePath={basePath}
                placeholder="제품명, 설명으로 검색"
                additionalParams={filters}
                onClick={() => setIsSearchOpen(true)}
                onSearch={() => setIsSearchOpen(false)}
              />
              <div className="flex justify-between">
                <SearchFilters
                  categories={categories}
                  filters={filters}
                  setFilters={setFilters}
                  isOpen={isFilterOpen}
                  setIsOpen={setIsFilterOpen}
                />
              </div>
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
                    >
                      <TrashIcon className="size-4" />
                      전체 삭제
                    </button>
                  </div>
                  <div className="flex gap-4 ml-4">
                    {localSearchHistory.map((item, index) => (
                      <div key={index} className="relative group">
                        <Link
                          href={`/search/products?keyword=${item.keyword}`}
                          className="flex items-center gap-1 text-sm text-white dark:text-gray-300"
                        >
                          <div className="bg-neutral-500 px-2 py-1 border-1 border-neutral-600 rounded-md hover:bg-neutral-700">
                            {item.keyword}
                          </div>
                        </Link>
                        <button
                          onClick={() => handleDeleteKeyword(item.keyword)}
                          className="absolute -top-2 -right-2 size-4 bg-gray-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <XMarkIcon className="size-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="mt-4 flex gap-8">
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
                        href={`/search/products?keyword=${item.keyword}`}
                        className="flex items-center gap-1 text-sm text-gray-700 dark:text-gray-300"
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

      {/* 드롭다운이 열려있을 때 배경 오버레이 */}
      {isSearchOpen && (
        <div
          className="fixed inset-0 bg-black/20 dark:bg-black/40 z-[-1]"
          onClick={() => setIsSearchOpen(false)}
        />
      )}
    </div>
  );
}
