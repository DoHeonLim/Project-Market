/**
File Name : app/products/view/[id]/loading
Description : 제품 상세 로딩 페이지
Author : 임도헌

History
Date        Author   Status    Description
2024.10.14  임도헌   Created
2024.10.14  임도헌   Modified  제품 상세 로딩 페이지 추가
2024.12.23  임도헌   Modified  제품 상세 로딩 페이지 아이콘 변경
2025.06.08  임도헌   Created   제품 상세 로딩 수정
*/

export default function Loading() {
  return (
    <div className="max-w-screen-sm mx-auto p-4 space-y-6 animate-pulse">
      {/* 이미지 영역 */}
      <div className="w-full h-72 bg-neutral-200 dark:bg-neutral-700 rounded-lg" />

      {/* 사용자 정보 */}
      <div className="flex items-center justify-between border-b pb-3 border-neutral-300 dark:border-neutral-700">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-neutral-300 dark:bg-neutral-600" />
          <div className="w-24 h-4 bg-neutral-300 dark:bg-neutral-600 rounded" />
        </div>
        <div className="w-14 h-4 bg-neutral-300 dark:bg-neutral-600 rounded" />
      </div>

      {/* 제목 및 가격 */}
      <div className="flex justify-between items-center">
        <div className="w-40 h-6 bg-neutral-300 dark:bg-neutral-600 rounded" />
        <div className="w-24 h-6 bg-neutral-300 dark:bg-neutral-600 rounded" />
      </div>

      {/* 정보 그리드 */}
      <div className="grid grid-cols-2 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-10 bg-neutral-200 dark:bg-neutral-700 rounded"
          />
        ))}
      </div>

      {/* 설명 */}
      <div className="space-y-2">
        <div className="w-24 h-4 bg-neutral-300 dark:bg-neutral-600 rounded" />
        <div className="h-20 bg-neutral-200 dark:bg-neutral-700 rounded" />
      </div>

      {/* 하단 액션 바 */}
      <div className="flex justify-between pt-6 border-t border-neutral-300 dark:border-neutral-700">
        <div className="w-24 h-10 bg-neutral-300 dark:bg-neutral-600 rounded" />
        <div className="w-24 h-10 bg-neutral-300 dark:bg-neutral-600 rounded" />
      </div>
    </div>
  );
}
