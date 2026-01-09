/**
 File Name : app/(tabs)/products/@modal/(..)products/view/[id]/loading
 Description : 모달 제품 상세 페이지 로딩 스켈레톤
 Author : 임도헌
 
 History
 Date        Author   Status    Description
 2024.10.22  임도헌   Created
 2024.10.22  임도헌   Modified  로딩 페이지 추가
 2024.12.11  임도헌   Modified  캐러셀 스켈레톤 추가
 2025.05.05  임도헌   Modified  로딩 UI 변경
 2025.06.08  임도헌   Created   모달 상세 페이지 로딩 수정
 2025.06.12  임도헌   Modified  app/(tabs)/products/@modal/(..)products/view/[id]/loading 로 이동
 */

export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
      <div className="flex flex-col w-full max-w-screen-sm h-[90vh] bg-white dark:bg-neutral-900 rounded-lg overflow-hidden animate-pulse">
        {/* 이미지 캐러셀 */}
        <div className="w-full h-72 bg-neutral-200 dark:bg-neutral-700" />

        {/* 사용자 정보 */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-300 dark:border-neutral-700">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-neutral-300 dark:bg-neutral-600" />
            <div className="w-24 h-4 bg-neutral-300 dark:bg-neutral-600 rounded" />
          </div>
          <div className="w-14 h-4 bg-neutral-300 dark:bg-neutral-600 rounded" />
        </div>

        {/* 스크롤 가능한 콘텐츠 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
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

          {/* 태그 */}
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="w-20 h-6 bg-neutral-300 dark:bg-neutral-600 rounded-full"
              />
            ))}
          </div>

          {/* 설명 */}
          <div className="space-y-2">
            <div className="w-24 h-4 bg-neutral-300 dark:bg-neutral-600 rounded" />
            <div className="h-20 bg-neutral-200 dark:bg-neutral-700 rounded" />
          </div>
        </div>

        {/* 액션 바 */}
        <div className="flex items-center justify-between p-4 border-t border-neutral-300 dark:border-neutral-700">
          <div className="w-24 h-10 bg-neutral-300 dark:bg-neutral-600 rounded" />
          <div className="w-24 h-10 bg-neutral-300 dark:bg-neutral-600 rounded" />
        </div>
      </div>
    </div>
  );
}
