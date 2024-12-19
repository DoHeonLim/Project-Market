/**
File Name : components/search/search-bar.tsx
Description : 검색 바 컴포넌트
Author : 임도헌

History
Date        Author   Status    Description
2024.12.17  임도헌   Created
2024.12.17  임도헌   Modified  검색 바 컴포넌트 생성
*/
"use client";

import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

interface SearchBarProps {
  basePath: string;
  placeholder?: string;
  additionalParams?: Record<string, string>;
  className?: string;
  onClick?: () => void;
}

export default function SearchBar({
  basePath,
  placeholder = "검색어를 입력하세요",
  additionalParams = {},
  className = "",
  onClick,
}: SearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const search = formData.get("search") as string;

    if (!search.trim()) return;

    startTransition(() => {
      const params = new URLSearchParams();

      // 검색어 추가
      params.set("keyword", search.trim());

      // 현재 URL의 파라미터 유지
      for (const [key, value] of Array.from(searchParams.entries())) {
        if (key !== "keyword" && !additionalParams[key]) {
          params.set(key, value);
        }
      }

      router.push(`${basePath}?${params.toString()}`);
    });
  };

  return (
    <form
      onSubmit={handleSearch}
      className={`relative flex-1 ${className}`}
      onClick={onClick}
    >
      <input
        type="text"
        name="search"
        placeholder={placeholder}
        defaultValue={searchParams.get("search") ?? ""}
        className="w-full px-4 py-2 pl-10 bg-neutral-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
      />
      <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
      {isPending && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </form>
  );
}
