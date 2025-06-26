/**
File Name : components/search/SearchBar
Description : 검색 바 컴포넌트
Author : 임도헌

History
Date        Author   Status    Description
2024.12.17  임도헌   Created
2024.12.17  임도헌   Modified  검색 바 컴포넌트 생성
2024.12.23  임도헌   Modified  검색 바 컴포넌트 다크모드 추가
2024.12.29  임도헌   Modified  검색후 섹션 컴포넌트 닫히게 변경
2025.04.18  임도헌   Modified  검색바 마진 수정
2025.04.30  임도헌   Modified  성능 최적화 및 사용자 경험 개선
2025.06.17  임도헌   Modified  검색어 입력 UI로 역할 축소, 도메인 독립 구조로 리팩토링
*/
"use client";

import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import { useState } from "react";
import { cn } from "@/lib/utils"; // tailwind-merge 혹은 clsx 대체용

interface SearchBarProps {
  placeholder?: string;
  defaultValue?: string;
  className?: string;
  autoFocus?: boolean;
  onSearch: (keyword: string) => void;
}

export default function SearchBar({
  placeholder = "검색어를 입력하세요",
  defaultValue = "",
  className = "",
  autoFocus = false,
  onSearch,
}: SearchBarProps) {
  const [keyword, setKeyword] = useState(defaultValue);
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = keyword.trim();
    if (!trimmed) return;

    setIsPending(true);
    onSearch(trimmed);
    setTimeout(() => setIsPending(false), 300); // 로딩 애니메이션용 (선택)
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("relative flex-1 mx-4", className)}
    >
      <input
        type="text"
        name="search"
        placeholder={placeholder}
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        autoFocus={autoFocus}
        className="w-full px-4 py-2 pl-10 bg-neutral-100/50 dark:bg-neutral-800/50 text-neutral-700 dark:text-neutral-300 placeholder-neutral-500 dark:placeholder-neutral-400 rounded-lg border border-neutral-200/20 dark:border-primary-dark/30 focus:outline-none focus:ring-2 focus:ring-primary/50 dark:focus:ring-primary-light/50 transition-colors"
      />
      <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-neutral-500" />
      {isPending && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <div className="w-4 h-4 border-2 border-indigo-400 dark:border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </form>
  );
}
