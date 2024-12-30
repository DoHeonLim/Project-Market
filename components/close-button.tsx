/**
File Name : components/close-button
Description : 닫기 버튼
Author : 임도헌

History
Date        Author   Status    Description
2024.10.22  임도헌   Created
2024.10.22  임도헌   Modified  close-button 컴포넌트 추가
2024.12.29  임도헌   Modified  z-index 추가

*/
"use client";

import { XMarkIcon } from "@heroicons/react/24/solid";
import { useRouter } from "next/navigation";

export default function CloseButton() {
  const router = useRouter();
  const handleCloseClick = () => {
    router.back();
  };
  return (
    <>
      <button
        aria-label="Close"
        onClick={handleCloseClick}
        className="absolute right-5 top-5 text-neutral-200 z-50"
      >
        <XMarkIcon className="size-10" />
      </button>
    </>
  );
}
