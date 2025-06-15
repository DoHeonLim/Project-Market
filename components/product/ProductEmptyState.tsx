/**
 * File Name : components/product/ProductEmptyState
 * Description : 제품이 존재하지 않을 때의 상태 메시지 컴포넌트
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2025.06.07  임도헌   Created  빈 상태 UI 컴포넌트 분리
 */

import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";

interface ProductEmptyStateProps {
  hasSearchParams: boolean;
}

export default function ProductEmptyState({
  hasSearchParams,
}: ProductEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 sm:py-20">
      <div className="p-4 rounded-full bg-gray-100 dark:bg-neutral-800">
        <MagnifyingGlassIcon className="size-8 text-gray-400 dark:text-gray-500" />
      </div>
      <p className="text-lg font-medium text-gray-500 dark:text-gray-400">
        {hasSearchParams ? "검색 결과가 없습니다." : "등록된 제품이 없습니다."}
      </p>
      {hasSearchParams && (
        <p className="text-sm text-gray-400 dark:text-gray-500">
          다른 검색어로 다시 시도해보세요.
        </p>
      )}
    </div>
  );
}
