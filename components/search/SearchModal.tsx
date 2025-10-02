/**
 * File Name : components/search/SearchModal
 * Description : 모바일/PC 검색 모달 UI 컴포넌트
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2025.06.21  임도헌   Created   검색 모달 UI 분리 (PC/모바일 공통)
 */

"use client";

import { XMarkIcon } from "@heroicons/react/24/outline";
import SearchBar from "./SearchBar";
import SearchHistoryBox from "./SearchHistoryBox";
import PopularSearchesBox from "./PopularSearchesBox";
import type {
  UserSearchHistoryItem,
  PopularSearchItem,
} from "@/app/(tabs)/products/actions/history";

interface SearchModalProps {
  isOpen: boolean;
  isMobile: boolean;
  keyword: string | undefined;
  basePath: string;
  searchHistory: UserSearchHistoryItem[];
  popularSearches: PopularSearchItem[];
  onSearch: (keyword: string) => void;
  onClose: () => void;
  onRemoveHistory: (keyword: string) => void;
  onClearHistory: () => void;
}

export default function SearchModal({
  isOpen,
  isMobile,
  keyword,
  basePath,
  searchHistory,
  popularSearches,
  onSearch,
  onClose,
  onRemoveHistory,
  onClearHistory,
}: SearchModalProps) {
  if (!isOpen) return null;

  // controlled value로 전달 (undefined일 경우 빈 문자열)
  const value = keyword ?? "";

  if (isMobile) {
    return (
      <div className="fixed inset-0 z-50 bg-white dark:bg-neutral-900">
        <div className="flex flex-col h-full">
          <div className="flex items-center gap-3 p-4 border-b dark:border-neutral-700">
            <button
              onClick={onClose}
              className="text-gray-500 dark:text-gray-400"
              aria-label="검색 닫기"
            >
              <XMarkIcon className="size-6" />
            </button>
            <SearchBar onSearch={onSearch} value={value} autoFocus />
          </div>

          <div className="flex-1 overflow-y-auto">
            <SearchHistoryBox
              history={searchHistory}
              onSearch={onSearch}
              onRemove={onRemoveHistory}
              onClear={onClearHistory}
              basePath={basePath}
              isMobile
            />

            <PopularSearchesBox
              popularSearches={popularSearches}
              onSearch={onSearch}
              basePath={basePath}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* 오버레이 */}
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />
      {/* 검색창 */}
      <div className="absolute inset-x-0 top-full bg-white dark:bg-neutral-900 border-b dark:border-neutral-700 shadow-lg z-50">
        <div className="p-4">
          <div className="flex gap-3">
            <SearchBar onSearch={onSearch} value={value} autoFocus />
          </div>

          <div className="mt-4 flex gap-8">
            <SearchHistoryBox
              history={searchHistory}
              onSearch={onSearch}
              onRemove={onRemoveHistory}
              onClear={onClearHistory}
              basePath={basePath}
            />

            <PopularSearchesBox
              popularSearches={popularSearches}
              onSearch={onSearch}
              basePath={basePath}
            />
          </div>

          <div className="mt-4 pt-4 border-t dark:border-neutral-700">
            <button
              onClick={onClose}
              className="w-full py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 flex items-center justify-center gap-2"
            >
              <XMarkIcon className="size-4" /> 검색창 닫기
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
