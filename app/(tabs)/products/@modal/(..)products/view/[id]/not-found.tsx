/**
 File Name : app/(tabs)/products/@modal/(..)products/view/[id]/not-found
 Description : 모달 제품 상세 페이지 Not Found UI
 Author : 임도헌
 
 History
 Date        Author   Status    Description
 2024.11.05  임도헌   Created
 2024.11.05  임도헌   Modified  notFound 페이지 추가
 2025.06.08  임도헌   Modified  상세 페이지 Not Found UI 추가
 2025.06.08  임도헌   Modified  모달 제품 상세 페이지 Not Found UI 공통 컴포넌트 적용
 2025.06.12  임도헌   Modified  app/(tabs)/products/@modal/(..)products/view/[id]/not-found 로 이동
 */
"use client";

import { useRouter } from "next/navigation";
import { XCircleIcon } from "@heroicons/react/24/solid";

export default function ProductModalNotFound() {
  const router = useRouter();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="max-w-sm w-full bg-white dark:bg-neutral-800 rounded-lg shadow-lg p-6 text-center space-y-4">
        <XCircleIcon className="mx-auto h-10 w-10 text-red-500" />
        <h2 className="text-lg font-semibold text-neutral-800 dark:text-white">
          해당 제품을 찾을 수 없습니다.
        </h2>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          삭제되었거나 존재하지 않는 제품입니다.
        </p>
        <button
          onClick={() => router.back()}
          className="mt-4 px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-md transition-colors"
        >
          닫기
        </button>
      </div>
    </div>
  );
}
