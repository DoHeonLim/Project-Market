/**
File Name : app/(tabs)/products/loading
Description : 제품 로딩 페이지
Author : 임도헌

History
Date        Author   Status    Description
2024.10.14  임도헌   Created
2024.10.14  임도헌   Modified  제품 로딩 페이지 추가
*/

export default function Loading() {
  return (
    <div className="flex flex-col gap-5 p-5 animate-pulse">
      {[...Array(10)].map((_, index) => (
        <div key={index} className="*:rounded-md flex gap-5">
          <div className="size-28 bg-neutral-700" />
          <div className="*:rounded-md flex flex-col gap-2">
            <div className="w-40 h-5 bg-neutral-700" />
            <div className="w-20 h-5 bg-neutral-700" />
            <div className="w-10 h-5 bg-neutral-700" />
          </div>
        </div>
      ))}
    </div>
  );
}
