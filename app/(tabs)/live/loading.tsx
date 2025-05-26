/**
File Name : app\(tabs)\live\loading.tsx
Description : 라이브 스트리밍 로딩 페이지
Author : 임도헌

History
Date        Author   Status    Description
2025.05.21  임도헌   Created
2025.05.21  임도헌   Modified  라이브 스트리밍 로딩 페이지 추가
*/
export default function Loading() {
  return (
    <div className="relative min-h-screen bg-background dark:bg-background-dark p-4 pb-24">
      {/* 탭 버튼 skeleton */}
      <div className="flex gap-2 mb-4">
        <div className="px-4 py-2 rounded-lg font-semibold bg-gray-200 dark:bg-neutral-700 w-24 h-10 animate-pulse" />
        <div className="px-4 py-2 rounded-lg font-semibold bg-gray-200 dark:bg-neutral-700 w-24 h-10 animate-pulse" />
      </div>

      {/* 카테고리/검색 skeleton */}
      <div className="sticky top-0 z-10 p-4 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm border-b border-neutral-200 dark:border-neutral-700">
        <div className="flex gap-2 mb-2">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-8 w-20 bg-gray-200 dark:bg-neutral-700 rounded-lg animate-pulse"
            />
          ))}
        </div>
        <div className="mt-4">
          <div className="h-10 bg-gray-200 dark:bg-neutral-700 rounded-lg animate-pulse w-full" />
        </div>
      </div>

      <div className="mt-6">
        <h1 className="text-2xl font-bold mb-6 dark:text-white">실시간 방송</h1>
        <div className="text-center text-gray-500 dark:text-gray-400 mt-10 mb-8">
          로딩 중...
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg" />
              <div className="mt-2 flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 방송 추가 플로팅 버튼 skeleton */}
      <div className="fixed bottom-24 right-6 bg-gray-200 dark:bg-neutral-700 rounded-full w-16 h-16 flex items-center justify-center text-4xl shadow-lg z-10 animate-pulse" />
    </div>
  );
}
