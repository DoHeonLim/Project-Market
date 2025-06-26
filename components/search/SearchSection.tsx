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
2025.06.15  임도헌   Modieifd  handleFilterRemove코드 수정(칩 삭제 시 페이지 이동)
2025.06.17  임도헌   Modified  useSearchHistory 및 모듈 분리 적용
2025.06.18  임도헌   Modified  filterTags 가격 칩 2개 나오는 오류 수정 
2025.06.21  임도헌   Modified  SearchModal 컴포넌트로 모달 구조 분리
*/
"use client";

import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import ProductCategoryDropdown from "./ProductCategoryDropdown";
import SearchChips from "./SearchChips";
import SearchModal from "./SearchModal";
import { useSearchContext } from "../providers/SearchProvider";
import { useSearchHistory } from "@/hooks/useSearchHistory";
import { useSearchParamsUtils } from "@/hooks/useSearchParamsUtils";
import type { Category } from "@prisma/client";
import type {
  UserSearchHistoryItem,
  PopularSearchItem,
} from "@/app/(tabs)/products/actions/history";
import clsx from "clsx";
import { useIsMobile } from "@/hooks/useIsMobile";

interface SearchSectionProps {
  categories: Category[];
  keyword: string | undefined;
  searchHistory: UserSearchHistoryItem[];
  popularSearches: PopularSearchItem[];
  basePath: string;
}

export default function SearchSection({
  categories,
  keyword,
  searchHistory,
  popularSearches,
  basePath,
}: SearchSectionProps) {
  const isMobile = useIsMobile();
  const { filters, setFilters, isSearchOpen, setIsSearchOpen } =
    useSearchContext();
  const { updateKeyword, removeParam, removeParams } = useSearchParamsUtils();

  const {
    history: localSearchHistory,
    addHistory,
    removeHistory,
    clearHistory,
  } = useSearchHistory(searchHistory);

  const handleSearch = (keyword: string) => {
    addHistory(keyword);
    updateKeyword(keyword);
    setIsSearchOpen(false);
  };

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

      {/* 필터 칩 */}
      <SearchChips
        filters={filters}
        categories={categories}
        setFilters={setFilters}
        removeParam={removeParam}
        removeParams={removeParams}
        closeSearch={() => setIsSearchOpen(false)}
        className={clsx("transition-all duration-200", {
          "h-0 overflow-hidden opacity-0 pointer-events-none m-0": isSearchOpen,
          "flex flex-wrap gap-2": !isSearchOpen,
        })}
      />

      {/* 검색 모달 */}
      <SearchModal
        isOpen={isSearchOpen}
        isMobile={isMobile}
        keyword={keyword}
        basePath={basePath}
        searchHistory={localSearchHistory}
        popularSearches={popularSearches}
        onSearch={handleSearch}
        onClose={() => setIsSearchOpen(false)}
        onRemoveHistory={removeHistory}
        onClearHistory={clearHistory}
      />
    </div>
  );
}
