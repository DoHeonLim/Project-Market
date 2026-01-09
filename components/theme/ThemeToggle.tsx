/**
 * File Name : components/theme/ThemeToggle
 * Description : 테마 변경 버튼
 * Author : 임도헌
 *
 * History
 * Date        Author   Status     Description
 * 2024.12.13  임도헌   Created
 * 2024.12.13  임도헌   Modified   테마 변경 버튼 추가
 * 2025.10.05  임도헌   Modified   접근성(aria-pressed/title) 및 마운트 처리 보강
 */

"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme, resolvedTheme } = useTheme();

  // hydration 깜빡임 방지
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const isDark = (resolvedTheme ?? theme) === "dark";
  const next = isDark ? "light" : "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      aria-label="테마 변경"
      aria-pressed={isDark}
      title={isDark ? "라이트 모드로 전환" : "다크 모드로 전환"}
      className="rounded-lg p-2.5 bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-colors shadow-sm"
    >
      {/* 심플 이모지 아이콘 유지 (추후 lucide-react로 교체 가능) */}
      <span className="text-xl" aria-hidden>
        {isDark ? "🌞" : "🌙"}
      </span>
    </button>
  );
}
