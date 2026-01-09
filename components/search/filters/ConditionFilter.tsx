/**
 * File Name : components/search/filters/ConditionFilter
 * Description : 검색 필터 - 제품 상태 필터 컴포넌트
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2025.06.18  임도헌   Created   제품 상태 필터 분리
 */

"use client";

interface ConditionFilterProps {
  value?: string;
  onChange: (value: string) => void;
}

const CONDITIONS = [
  { value: "", label: "전체" },
  { value: "NEW", label: "새 상품" },
  { value: "USED", label: "중고 상품" },
];

export default function ConditionFilter({
  value,
  onChange,
}: ConditionFilterProps) {
  return (
    <div>
      <label className="block text-sm mb-1 dark:text-white">제품 상태</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-1 border dark:border-neutral-600 rounded bg-white dark:bg-neutral-700 dark:text-white"
      >
        {CONDITIONS.map((condition) => (
          <option key={condition.value} value={condition.value}>
            {condition.label}
          </option>
        ))}
      </select>
    </div>
  );
}
