/**
 File Name : app/(tabs)/products/(..)products/[id]/loading
 Description : products/[id] 인터셉트 후 모달 로딩 페이지
 Author : 임도헌
 
 History
 Date        Author   Status    Description
 2024.10.22  임도헌   Created
 2024.10.22  임도헌   Modified  로딩 페이지 추가
 2024.12.11  임도헌   Modified  캐러셀 스켈레톤 추가
 */

import { PhotoIcon } from "@heroicons/react/24/solid";

export default function Loading() {
  return (
    <div className="fixed top-0 left-0 z-50 flex items-center justify-center w-full h-full bg-black bg-opacity-60">
      <div className="flex flex-col justify-center h-auto max-w-screen-sm overflow-hidden rounded-lg bg-neutral-700">
        <div className="w-64 max-w-screen-sm md:w-96">
          <div className="relative aspect-square w-full animate-pulse">
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
        </div>
        <div className="flex items-center gap-2 p-5 border-b border-neutral-700">
          <div className="rounded-full size-14 bg-neutral-700" />
          <div className="flex flex-col gap-1">
            <div className="w-40 h-5 rounded-md bg-neutral-700" />
            <div className="w-20 h-5 rounded-md bg-neutral-700" />
          </div>
        </div>
        <div className="p-3 max-w-[256px] md:max-w-[384px]">
          <div className="w-40 h-8 mb-2 rounded-md bg-neutral-700" />
          <div className="w-full h-5 rounded-md bg-neutral-700" />
        </div>
        <div className="flex items-center justify-between max-w-screen-sm gap-5 p-5 bg-neutral-800">
          <div className="w-32 h-7 rounded-md bg-neutral-700" />
          <div className="w-24 h-8 rounded-md bg-neutral-700" />
        </div>
      </div>
    </div>
  );
}
