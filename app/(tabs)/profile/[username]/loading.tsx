// 유저 프로필 스켈레톤
export function ProfileSkeleton() {
  return (
    <div className="flex flex-col items-center gap-4 my-4 px-4 animate-pulse">
      <div className="h-8 w-48 bg-neutral-600 rounded-lg" />

      <div className="flex gap-10 rounded-xl border-[2px] border-neutral-500 w-full py-10">
        <div className="w-full md:flex-row md:mr-10 flex flex-col justify-around items-center space-y-6">
          <div className="md:flex-row flex flex-col items-center justify-center w-full gap-6">
            <div className="rounded-full w-52 h-52 bg-neutral-600" />
            <div className="flex flex-col items-center md:items-start justify-center gap-4">
              <div className="h-6 w-32 bg-neutral-600 rounded-lg" />
              <div className="h-4 w-48 bg-neutral-600 rounded-lg" />
              <div className="h-5 w-40 bg-neutral-600 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 제품 리스트 스켈레톤
export function ProductsSkeleton() {
  return (
    <div className="flex flex-col gap-4 animate-pulse">
      {[1, 2, 3, 4].map((item) => (
        <div
          key={item}
          className="flex gap-5 p-4 transition-colors rounded-xl bg-transparent"
        >
          <div className="relative overflow-hidden rounded-md size-28 bg-neutral-600" />
          <div className="flex flex-col gap-3 flex-1">
            <div className="h-6 w-3/4 bg-neutral-600 rounded-lg" />
            <div className="h-4 w-1/3 bg-neutral-600 rounded-lg" />
            <div className="h-6 w-1/4 bg-neutral-600 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}

// 기본 export는 전체 페이지 로딩
export default function Loading() {
  return (
    <>
      <ProfileSkeleton />
      <div className="w-full max-w-5xl mt-8 px-4">
        <div className="flex justify-center gap-4 mb-6">
          <div className="h-10 w-24 bg-neutral-600 rounded-md animate-pulse" />
          <div className="h-10 w-24 bg-neutral-600 rounded-md animate-pulse" />
        </div>
        <ProductsSkeleton />
      </div>
    </>
  );
}
