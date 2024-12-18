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
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FilterState } from "./search-section";
import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";

interface SearchBarProps {
  filters: FilterState;
  onSearch: () => void;
}

const SearchBar = ({ filters, onSearch }: SearchBarProps) => {
  const [keyword, setKeyword] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (keyword.trim()) {
      const searchParams = new URLSearchParams();
      searchParams.set("keyword", keyword.trim());

      // 필터 값이 있는 경우에만 URL에 추가
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          searchParams.set(key, value);
        }
      });

      router.push(`/search/products?${searchParams.toString()}`);
      onSearch();
    }
  };

  return (
    <form onSubmit={handleSearch} className="relative flex-1">
      <input
        type="text"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        placeholder="제품명, 설명으로 검색"
        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-neutral-800 dark:border-neutral-700"
      />
      <button
        type="submit"
        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
      >
        <MagnifyingGlassIcon className="size-5" />
      </button>
    </form>
  );
};

export default SearchBar;
