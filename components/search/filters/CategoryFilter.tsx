/**
 * File Name : components/search/filters/CategoryFilter
 * Description : 검색 필터 - 카테고리 필터 컴포넌트
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2025.06.18  임도헌   Created   카테고리 필터 분리 및 option 렌더링 최적화
 */

"use client";

interface Category {
  id: number;
  icon: string | null;
  kor_name: string;
  eng_name: string;
  description: string | null;
  parentId: number | null;
}

interface CategoryFilterProps {
  parentCategories: Category[];
  childCategories: Category[];
  selectedParentCategory?: string;
  onParentChange: (value: string) => void;
  selectedChildCategory?: string;
  onChildChange: (value: string) => void;
}

export default function CategoryFilter({
  parentCategories,
  childCategories,
  selectedParentCategory,
  onParentChange,
  selectedChildCategory,
  onChildChange,
}: CategoryFilterProps) {
  const renderCategoryOptions = (categories: Category[]) =>
    categories.map(({ id, icon, kor_name }) => (
      <option key={id} value={id.toString()}>
        {icon} {kor_name}
      </option>
    ));

  return (
    <div>
      {/* <label className="block text-sm mb-1 dark:text-white">카테고리</label>
      <select
        value={selectedParentCategory}
        onChange={(e) => handleParentCategoryChange(e.target.value)}
        className="w-full px-3 py-1 bg-white dark:text-white dark:bg-neutral-700 border dark:border-neutral-600 rounded"
        aria-label="부모 카테고리 선택"
      >
        <option value="">전체</option>
        {parentCategories.map((category) => (
          <option key={category.id} value={category.id.toString()}>
            {category.icon} {category.kor_name}
          </option>
        ))}
      </select>

      {selectedParentCategory && (
        <select
          value={tempFilters.category}
          onChange={(e) => handleChildCategoryChange(e.target.value)}
          className="w-full px-3 py-1 bg-white dark:text-white dark:bg-neutral-700 border dark:border-neutral-600 rounded mt-2"
          aria-label="자식 카테고리 선택"
        >
          <option value={selectedParentCategory}>전체</option>
          {childCategories.map((child) => (
            <option key={child.id} value={child.id.toString()}>
              {child.icon} {child.kor_name}
            </option>
          ))}
        </select>
      )} */}
      <label className="block text-sm mb-1 dark:text-white">카테고리</label>
      <select
        value={selectedParentCategory}
        onChange={(e) => onParentChange(e.target.value)}
        className="w-full px-3 py-1 bg-white dark:text-white dark:bg-neutral-700 border dark:border-neutral-600 rounded"
        aria-label="부모 카테고리 선택"
      >
        <option value="">전체</option>
        {renderCategoryOptions(parentCategories)}
      </select>

      {selectedParentCategory && (
        <select
          value={selectedChildCategory}
          onChange={(e) => onChildChange(e.target.value)}
          className="w-full px-3 py-1 bg-white dark:text-white dark:bg-neutral-700 border dark:border-neutral-600 rounded mt-2"
          aria-label="자식 카테고리 선택"
        >
          <option value={selectedParentCategory}>전체</option>
          {renderCategoryOptions(childCategories)}
        </select>
      )}
    </div>
  );
}
