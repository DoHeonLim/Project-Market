/**
 File Name : app/(tabs)/products/(..)products/[id]/loading
 Description : products/[id] 인터셉트 후 모달 로딩 페이지
 Author : 임도헌
 
 History
 Date        Author   Status    Description
 2024.10.22  임도헌   Created
 2024.10.22  임도헌   Modified  로딩 페이지 추가
 2024.12.11  임도헌   Modified  캐러셀 스켈레톤 추가
 2025.05.05  임도헌   Modified  로딩 UI 변경
 */

import { PhotoIcon } from "@heroicons/react/24/solid";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="flex flex-col max-w-screen-sm py-2 bg-white dark:bg-neutral-800 rounded-lg overflow-hidden max-h-[90vh]">
        <div className="w-full h-[300px] relative">
          <div className="flex items-center justify-center w-full h-full border-4 border-dashed rounded-md text-neutral-700 border-neutral-700">
            <PhotoIcon className="h-28" />
          </div>
          {/* 캐러셀 인디케이터 스켈레톤 */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="w-2 h-2 rounded-full bg-neutral-700" />
            ))}
          </div>
          {/* 이미지 카운터 스켈레톤 */}
          <div className="absolute top-4 left-4 px-2 py-1 rounded-full bg-neutral-700 w-12 h-6" />
        </div>

        {/* 판매자 정보 스켈레톤 */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50">
          <div className="flex items-center gap-2">
            <div className="rounded-full size-14 bg-neutral-700" />
            <div className="flex flex-col gap-1">
              <div className="w-40 h-5 rounded-md bg-neutral-700" />
              <div className="w-20 h-5 rounded-md bg-neutral-700" />
            </div>
          </div>
          <div className="w-24 h-6 rounded-md bg-neutral-700" />
        </div>

        {/* 제품 정보 스켈레톤 */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-4">
            <div className="flex flex-col gap-2">
              <div className="w-40 h-8 rounded-md bg-neutral-700" />
              <div className="w-full h-6 rounded-md bg-neutral-700" />
            </div>
            <div className="grid grid-cols-2 gap-4 p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg border border-neutral-200 dark:border-neutral-700">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="w-full h-6 rounded-md bg-neutral-700" />
              ))}
            </div>
          </div>
        </div>

        {/* 하단 액션 바 스켈레톤 */}
        <div className="border-t dark:border-neutral-700 p-4 bg-white dark:bg-neutral-800 backdrop-blur-lg">
          <div className="flex items-center justify-between">
            <div className="w-32 h-7 rounded-md bg-neutral-700" />
            <div className="w-24 h-8 rounded-md bg-neutral-700" />
          </div>
        </div>
      </div>
    </div>
  );
}
