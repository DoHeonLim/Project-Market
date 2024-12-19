/**
File Name : app/(tabs)/posts/loading
Description : 항해일지 로딩 페이지
Author : 임도헌

History
Date        Author   Status    Description
2024.11.01  임도헌   Created
2024.11.01  임도헌   Modified  동네생활 로딩 페이지 추가
2024.12.18  임도헌   Modified  항해일지 로딩 페이지 추가
2024.12.18  임도헌   Modified  카테고리 탭 스켈레톤 추가
*/

export default function Loading() {
  return (
    <div className="p-5">
      {/* 카테고리 탭 스켈레톤 */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="w-20 h-10 bg-neutral-800 rounded-full animate-pulse"
          />
        ))}
      </div>

      {/* 게시글 스켈레톤 */}
      <div className="grid gap-4 mt-4">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="flex gap-4 p-4 bg-neutral-800/30 rounded-lg animate-pulse"
          >
            <div className="w-24 h-24 bg-neutral-700 rounded-md shrink-0" />
            <div className="flex-1 space-y-3">
              <div className="h-4 w-20 bg-neutral-700 rounded-full" />
              <div className="h-6 w-3/4 bg-neutral-700 rounded-md" />
              <div className="h-4 w-full bg-neutral-700 rounded-md" />
              <div className="flex gap-2">
                {[...Array(2)].map((_, j) => (
                  <div
                    key={j}
                    className="h-4 w-12 bg-neutral-700 rounded-full"
                  />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
