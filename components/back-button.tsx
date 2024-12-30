/**
 File Name : components/back-button.tsx
 Description : 뒤로가기 버튼 컴포넌트
 Author : 임도헌
 
 History
 Date        Author   Status    Description
 2024.12.11  임도헌   Created
 2024.12.11  임도헌   Modified  뒤로가기 버튼 컴포넌트 추가
 */

"use client";

import { ArrowLeftCircleIcon } from "@heroicons/react/24/solid";
import { useRouter } from "next/navigation";

interface BackButtonProps {
  className?: string;
}

export default function BackButton({ className = "" }: BackButtonProps) {
  const router = useRouter();

  return (
    <div
      className={`fixed left-1/2 -translate-x-1/2 top-0 z-10 max-w-screen-sm w-full ${className}`}
    >
      <button
        onClick={() => router.back()}
        className="p-3 text-neutral-500 transition-colors hover:text-neutral-300 flex justify-start"
      >
        <ArrowLeftCircleIcon className="w-10 h-10 text-semibold" />
      </button>
    </div>
  );
}
