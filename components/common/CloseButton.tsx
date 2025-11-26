/**
 * File Name : components/common/CloseButton
 * Description : 닫기 버튼
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2024.10.22  임도헌   Created
 * 2024.10.22  임도헌   Modified  close-button 컴포넌트 추가
 * 2024.12.29  임도헌   Modified  z-index 추가
 * 2025.05.10  임도헌   Modified  스타일 변경
 * 2025.06.15  임도헌   Modified  href 속성 추가
 * 2025.11.13  임도헌   Modified  router.back 가능시 back, 불가시 fallbackHref/returnTo로 push
 */
"use client";

import { XMarkIcon } from "@heroicons/react/24/solid";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useCallback } from "react";

interface Props {
  /** 폴백 경로. 보통 "/products" */
  fallbackHref?: string;
  /** 우선순위가 가장 높은 복귀 경로(리스트 쿼리 보존). 없으면 searchParams의 returnTo, 그마저 없으면 fallbackHref */
  returnTo?: string;
  /** aria-label 지정 */
  label?: string;
  className?: string;
}

export default function CloseButton({
  fallbackHref = "/products",
  returnTo,
  label = "닫기",
  className = "p-2 rounded-md hover:bg-black/5 dark:hover:bg-white/10",
}: Props) {
  const router = useRouter();
  const sp = useSearchParams();

  // history idx가 1 이상이면 back 가능(앱 라우터에서도 window.history.state.idx 사용 가능)
  const canGoBack =
    typeof window !== "undefined" && (window.history.state?.idx ?? 0) > 0;

  const resolvedReturnTo = returnTo || sp.get("returnTo") || fallbackHref;

  const onClose = useCallback(() => {
    if (canGoBack) router.back();
    else router.push(resolvedReturnTo);
  }, [canGoBack, router, resolvedReturnTo]);

  // ESC로 닫기
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <button
      type="button"
      onClick={onClose}
      aria-label={label}
      className={className}
    >
      <XMarkIcon className="size-6" />
    </button>
  );
}
