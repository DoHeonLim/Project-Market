/**
 * File Name : components/product/SearchResultSummary
 * Description : 검색 조건에 따른 결과 개수 및 요약 텍스트 표시 컴포넌트
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2025.06.07  임도헌   Created  검색 결과 요약 컴포넌트 생성
 */

interface SearchResultSummaryProps {
  count: number;
  summaryText: string;
}

export default function SearchResultSummary({
  count,
  summaryText,
}: SearchResultSummaryProps) {
  if (!summaryText) return null;

  return (
    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
      <div className="flex items-center gap-2">
        <span className="font-medium">검색결과</span>
        <span className="px-2 py-1 text-xs font-semibold bg-primary/50 dark:bg-primary-dark/50 text-black dark:text-white rounded-full">
          {count}개
        </span>
      </div>
      <span className="text-gray-400 dark:text-gray-500">{summaryText}</span>
    </div>
  );
}
