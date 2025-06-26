/**
 * File Name : components/search/filters/PriceFilter
 * Description : 검색 필터 - 가격 범위 필터 컴포넌트
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2025.06.18  임도헌   Created   가격 범위 필터 분리
 */

"use client";

interface PriceFilterProps {
  minPrice?: string;
  maxPrice?: string;
  onChangeKeyValue: (key: "minPrice" | "maxPrice", value: string) => void;
}

export default function PriceFilter({
  minPrice,
  maxPrice,
  onChangeKeyValue,
}: PriceFilterProps) {
  return (
    <div>
      <label className="block text-sm mb-1 dark:text-white">가격 범위</label>
      <div className="flex gap-2">
        <input
          type="number"
          value={minPrice ?? ""}
          onChange={(e) => onChangeKeyValue("minPrice", e.target.value)}
          placeholder="최소"
          className="w-full px-3 py-1 border dark:border-neutral-600 rounded bg-white dark:bg-neutral-700 dark:text-white"
          aria-label="min-price"
          min="0"
        />
        <input
          type="number"
          value={maxPrice ?? ""}
          onChange={(e) => onChangeKeyValue("maxPrice", e.target.value)}
          placeholder="최대"
          className="w-full px-3 py-1 border dark:border-neutral-600 rounded bg-white dark:bg-neutral-700 dark:text-white"
          aria-label="max-price"
          min="0"
        />
      </div>
    </div>
  );
}
