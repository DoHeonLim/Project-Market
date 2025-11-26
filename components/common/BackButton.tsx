/**
 * File Name : components/common/BackButton
 * Description : 뒤로가기 버튼 컴포넌트
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2024.12.11  임도헌   Created
 * 2024.12.11  임도헌   Modified  뒤로가기 버튼 컴포넌트 추가
 * 2025.04.28  임도헌   Modified  href props 추가
 * 2025.11.13  임도헌   Modified  UI 변경
 */
"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Props = {
  fallbackHref?: string; // 히스토리 없을 때 이동할 안전 경로
  variant?: "appbar" | "inline"; // appbar: 상단바, inline: 컨텐츠 헤더용
  label?: string;
  className?: string;
};

export default function BackButton({
  fallbackHref = "/",
  variant = "appbar",
  label = "뒤로가기",
  className = "",
}: Props) {
  const router = useRouter();
  const [canGoBack, setCanGoBack] = useState(false);

  useEffect(() => {
    // 히스토리 길이로 1차 판단
    setCanGoBack(window.history.length > 1);
  }, []);

  const handleClick = () => {
    if (
      canGoBack &&
      document.referrer &&
      new URL(document.referrer)?.origin === window.location.origin
    ) {
      router.back();
    } else {
      router.push(fallbackHref);
    }
  };

  const base =
    "inline-flex items-center justify-center rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 " +
    "transition active:scale-[.98]";

  const styles =
    variant === "appbar"
      ? "h-10 w-10 md:h-9 md:w-9 border border-neutral-200/70 dark:border-neutral-700 " +
        "bg-white/80 dark:bg-neutral-900/80 backdrop-blur text-neutral-700 dark:text-neutral-200"
      : "h-9 px-2 text-sm text-neutral-600 hover:text-neutral-900 dark:text-neutral-300 " +
        "dark:hover:text-white";

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`${base} ${styles} ${className}`}
      aria-label={label}
    >
      {/* 아이콘은 텍스트보다 의미 전달이 중요: */}
      <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
        <path
          fill="currentColor"
          d="M12.7 4.7a1 1 0 0 1 0 1.4L9.8 9l2.9 2.9a1 1 0 1 1-1.4 1.4l-3.6-3.6a1 1 0 0 1 0-1.4l3.6-3.6a1 1 0 0 1 1.4 0z"
        />
      </svg>
      {variant === "inline" && <span className="ml-1">뒤로</span>}
    </button>
  );
}
