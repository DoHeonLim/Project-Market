/**
File Name : app/(tabs)/products/loading
Description : 제품 로딩 페이지
Author : 임도헌

History
Date        Author   Status    Description
2024.10.14  임도헌   Created
2024.10.14  임도헌   Modified  제품 로딩 페이지 추가
2025.06.08  임도헌   Created   제품 목록 로딩 수정
*/

export default function Loading() {
  return (
    <div className="grid grid-cols-2 gap-4 p-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex flex-col space-y-2 animate-pulse">
          <div className="w-full h-40 bg-neutral-200 dark:bg-neutral-700 rounded-lg" />
          <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-3/4" />
          <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-1/2" />
        </div>
      ))}
    </div>
  );
}
