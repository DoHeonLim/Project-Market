/**
File Name : components/common/CloseButton
Description : 닫기 버튼
Author : 임도헌

History
Date        Author   Status    Description
2024.10.22  임도헌   Created
2024.10.22  임도헌   Modified  close-button 컴포넌트 추가
2024.12.29  임도헌   Modified  z-index 추가
2025.05.10  임도헌   Modified  스타일 변경
2025.06.15  임도헌   Modified  href 속성 추가
*/
"use client";

import { XMarkIcon } from "@heroicons/react/24/solid";
import { useRouter } from "next/navigation";

export default function CloseButton({ href }: { href: string }) {
  const router = useRouter();
  return (
    <button
      onClick={() => router.push(`/${href}`)}
      aria-label="모달 닫기"
      className="text-sm px-3 py-1 rounded-md text-neutral-600 dark:text-neutral-200 transition"
    >
      <XMarkIcon className="size-10" />
    </button>
  );
}
