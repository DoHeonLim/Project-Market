/**
 * File Name : components/search/PopularSearchesBox
 * Description : 인기 검색어 목록 컴포넌트 (PC 및 모바일 공통)
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2025.06.21  임도헌   Created   SearchSection에서 인기 검색 UI 분리
 */

"use client";

import { FireIcon } from "@heroicons/react/24/solid";
import Link from "next/link";

interface PopularSearchesBoxProps {
  popularSearches: { keyword: string; count: number }[];
  onSearch: (keyword: string) => void;
  basePath: string;
}

export default function PopularSearchesBox({
  popularSearches,
  onSearch,
  basePath,
}: PopularSearchesBoxProps) {
  if (!popularSearches || popularSearches.length === 0) return null;

  return (
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
            onClick={() => onSearch(item.keyword)}
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
  );
}
