/**
 * File Name : components/search/SearchHistoryBox.tsx
 * Description : 최근 검색어 목록 컴포넌트 (PC 및 모바일 공통)
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2025.06.21  임도헌   Created   SearchSection에서 최근 검색 UI 분리
 */

"use client";

import { XMarkIcon, ClockIcon, TrashIcon } from "@heroicons/react/24/solid";
import Link from "next/link";

interface SearchHistoryBoxProps {
  history: { keyword: string; created_at: Date }[];
  onSearch: (keyword: string) => void;
  onRemove: (keyword: string) => void;
  onClear: () => void;
  basePath: string;
  isMobile?: boolean;
}

export default function SearchHistoryBox({
  history,
  onSearch,
  onRemove,
  onClear,
  basePath,
  isMobile = false,
}: SearchHistoryBoxProps) {
  if (!history || history.length === 0) return null;

  return (
    <div className="p-4 flex-1">
      <div className="flex items-center justify-between mb-2">
        <h3 className="flex items-center gap-1 text-sm font-medium text-gray-500 dark:text-gray-400">
          <ClockIcon className="size-4" />
          최근 검색어
        </h3>
        <button
          onClick={onClear}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          aria-label="전체 검색 기록 삭제"
        >
          <TrashIcon className="size-4" />
          전체 삭제
        </button>
      </div>

      {isMobile ? (
        <div className="flex gap-4 ml-4">
          {history.map((item, index) => (
            <div key={index} className="relative group">
              <Link
                href={`${basePath}?keyword=${item.keyword}`}
                onClick={() => onSearch(item.keyword)}
                className="flex items-center gap-1 text-xs text-white dark:text-gray-300"
              >
                <div className="bg-neutral-500 px-2 py-1 border-1 border-neutral-600 rounded-md hover:bg-neutral-700">
                  {item.keyword}
                </div>
              </Link>
              <button
                onClick={() => onRemove(item.keyword)}
                className="absolute -top-2 -right-2 size-4 bg-gray-500 text-white rounded-full flex items-center justify-center opacity-0 hover:bg-neutral-800 group-hover:opacity-100 transition-opacity"
                aria-label={`${item.keyword} 검색 기록 삭제`}
              >
                <XMarkIcon className="size-3" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex gap-2 ml-4">
          {history.map((item, index) => (
            <div key={index} className="relative group">
              <div className="flex items-center gap-1">
                <Link
                  href={`${basePath}?keyword=${item.keyword}`}
                  onClick={() => onSearch(item.keyword)}
                  className="text-sm text-white dark:text-gray-300"
                >
                  <div className="bg-neutral-500 px-2 py-1 border-1 border-neutral-600 rounded-md hover:bg-neutral-700">
                    {item.keyword}
                  </div>
                </Link>
                <button
                  onClick={() => onRemove(item.keyword)}
                  className="relative -top-3 right-3 size-4 bg-gray-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-neutral-800 transition-opacity"
                  aria-label={`${item.keyword} 검색 기록 삭제`}
                >
                  <XMarkIcon className="size-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
