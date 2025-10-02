/**
 * File Name : components/search/SearchChips
 * Description : 검색 필터에 따라 렌더링되는 칩 UI
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2025.06.21  임도헌   Created   filterTags useMemo를 분리한 칩 컴포넌트 생성
 */

"use client";

import {
  GAME_TYPE_DISPLAY,
  CONDITION_DISPLAY,
  FilterState,
} from "@/lib/constants";
import { getCategoryName } from "@/lib/category/getCategoryName";
import type { Category } from "@prisma/client";
import clsx from "clsx";

interface SearchChipsProps {
  filters: FilterState;
  categories: Category[];
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  removeParam: (key: string) => void;
  removeParams: (...keys: string[]) => void;
  closeSearch: () => void;
  className?: string;
}

export default function SearchChips({
  filters,
  categories,
  setFilters,
  removeParam,
  removeParams,
  closeSearch,
  className,
}: SearchChipsProps) {
  const chips: JSX.Element[] = [];

  if (filters.minPrice || filters.maxPrice) {
    chips.push(
      <div
        key="price"
        className="flex items-center gap-1 px-3 py-1 text-sm bg-primary/10 dark:bg-primary-light/10 text-primary dark:text-primary-light rounded-full"
      >
        <span>
          가격: {filters.minPrice ? `${filters.minPrice}원` : "0원"} ~{" "}
          {filters.maxPrice ? `${filters.maxPrice}원` : "무제한"}
        </span>
        <button
          onClick={() => {
            setFilters((prev) => ({ ...prev, minPrice: "", maxPrice: "" }));
            removeParams("minPrice", "maxPrice");
            closeSearch();
          }}
          className="ml-1 text-primary/70 dark:text-primary-light/70 hover:text-primary dark:hover:text-primary-light"
          aria-label="가격 필터 제거"
        >
          ×
        </button>
      </div>
    );
  }

  Object.entries(filters).forEach(([key, value]) => {
    if (!value || key === "minPrice" || key === "maxPrice") return;

    let displayValue = value;
    if (key === "game_type") {
      displayValue = GAME_TYPE_DISPLAY[value as keyof typeof GAME_TYPE_DISPLAY];
    } else if (key === "condition") {
      displayValue = CONDITION_DISPLAY[value as keyof typeof CONDITION_DISPLAY];
    } else if (key === "category") {
      displayValue = getCategoryName(value, categories);
    }

    const label =
      key === "game_type"
        ? `게임 타입: ${displayValue}`
        : key === "condition"
          ? `상태: ${displayValue}`
          : `카테고리: ${displayValue}`;

    chips.push(
      <div
        key={key}
        className="flex items-center gap-1 px-3 py-1 text-sm bg-primary/10 dark:bg-primary-light/10 text-primary dark:text-primary-light rounded-full"
      >
        <span>{label}</span>
        <button
          onClick={() => {
            setFilters((prev) => ({ ...prev, [key]: "" }));
            removeParam(key);
            closeSearch();
          }}
          className="ml-1 text-primary/70 dark:text-primary-light/70 hover:text-primary dark:hover:text-primary-light"
          aria-label={`${key} 필터 제거`}
        >
          ×
        </button>
      </div>
    );
  });

  return (
    <div
      className={clsx(
        "flex flex-wrap gap-2",
        {
          "m-3": chips.length > 0,
          "m-0": chips.length === 0,
        },
        className
      )}
    >
      {chips}
    </div>
  );
}
