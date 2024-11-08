/**
File Name : app/(tabs)/life/loading
Description : 동네생활 로딩 페이지
Author : 임도헌

History
Date        Author   Status    Description
2024.11.01  임도헌   Created
2024.11.01  임도헌   Modified  동네생활 로딩 페이지 추가
*/

export default function Loading() {
  return (
    <div className="flex flex-col gap-5 p-5 animate-pulse">
      {[...Array(10)].map((_, index) => (
        <div key={index} className="*:rounded-md flex gap-5">
          <div className="*:rounded-md flex flex-col gap-2">
            <div className="w-20 h-5 bg-neutral-700" />
            <div className="w-40 h-5 bg-neutral-700" />
            <div className="flex gap-2 *:rounded-md">
              <div className="w-5 h-5 bg-neutral-700" />
              <div className="w-5 h-5 bg-neutral-700" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
