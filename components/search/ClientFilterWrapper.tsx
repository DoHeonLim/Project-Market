/**
 * File Name : components/search/ClientFilterWrapper
 * Description : 클라이언트 사이드에서 필터 적용용 Wrapper
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2025.06.18  임도헌   Created
 * 2025.06.18  임도헌   Modified  서버컴포넌트에서 필터 상태를 클라이언트에서 다루기 위한 컴포넌트
 */
"use client";

import { useState } from "react";
import SearchFilters from "./SearchFilters";
import type { Category } from "@/generated/prisma/client";
import { FilterState } from "@/lib/constants";
import { AdjustmentsHorizontalIcon } from "@heroicons/react/24/outline";

interface Props {
  categories: Category[];
  filters: FilterState;
}

export default function ClientFilterWrapper({ categories, filters }: Props) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  return (
    <div className="relative flex justify-end">
      <button
        onClick={() => setIsFilterOpen(true)}
        className="flex gap-2 px-2 p-1 mb-1 text-black dark:text-white border border-neutral-200/20 dark:border-primary-dark/30 rounded-lg hover:bg-primary/50 dark:hover:bg-primary-light/50 transition-colors"
      >
        필터
        <AdjustmentsHorizontalIcon className="size-6" />
      </button>
      <SearchFilters
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        categories={categories}
        filters={filters}
      />
    </div>
  );
}
