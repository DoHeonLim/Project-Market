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
*/
"use client";

import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import { useRouter, useSearchParams } from "next/navigation";
import { useTransition, useCallback } from "react";

interface SearchBarProps {
  basePath: string;
  placeholder?: string;
  additionalParams?: Record<string, string>;
  className?: string;
  onClick?: () => void;
  onSearch?: (keyword: string) => void;
  autoFocus?: boolean;
  initialKeyword?: string;
}

export default function SearchBar({
  basePath,
  placeholder = "검색어를 입력하세요",
  additionalParams = {},
  className = "",
  onClick,
  onSearch,
  autoFocus = false,
  initialKeyword,
}: SearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const handleSearch = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      const search = formData.get("search") as string;

      if (!search.trim()) return;

      startTransition(() => {
        const params = new URLSearchParams();

        // 검색어 추가
        params.set("keyword", search.trim());

        // 추가 파라미터 설정
        Object.entries(additionalParams).forEach(([key, value]) => {
          if (value) params.set(key, value);
        });

        router.push(`${basePath}?${params.toString()}`);
        router.refresh();
        // onSearch가 존재하면 함수로 호출
        onSearch?.(search.trim());
      });
    },
    [basePath, additionalParams, router, onSearch]
  );

  return (
    <form
      onSubmit={handleSearch}
      className={`relative flex-1 mx-4 ${className}`}
      onClick={onClick}
    >
      <input
        type="text"
        name="search"
        placeholder={placeholder}
        defaultValue={initialKeyword ?? searchParams.get("keyword") ?? ""}
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
