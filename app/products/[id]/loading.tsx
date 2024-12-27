/**
File Name : app/products/[id]/loading
Description : 제품 상세 로딩 페이지
Author : 임도헌

History
Date        Author   Status    Description
2024.10.14  임도헌   Created
2024.10.14  임도헌   Modified  제품 상세 로딩 페이지 추가
2024.12.23  임도헌   Modified  제품 상세 로딩 페이지 아이콘 변경
*/

export default function Loading() {
  return (
    <div className="flex flex-col gap-5 p-5 animate-pulse">
      <div className="flex items-center justify-center border-4 border-dashed rounded-md text-neutral-700 aspect-square border-neutral-700">
        <span className="text-4xl">🎲</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="rounded-full size-14 bg-neutral-700" />
        <div className="flex flex-col gap-1">
          <div className="w-40 h-5 rounded-md bg-neutral-700" />
          <div className="w-20 h-5 rounded-md bg-neutral-700" />
        </div>
      </div>
      <div className="h-5 rounded-md w-80 bg-neutral-700" />
    </div>
  );
}
