/**
File Name : components/theme/ThemeToggle
Description : 테마 변경 버튼
Author : 임도헌

History
Date        Author   Status    Description
2024.12.13  임도헌   Created
2024.12.13  임도헌   Modified  테마 변경 버튼 추가
*/

"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  // hydration을 위한 마운트 체크
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="rounded-lg p-2.5 bg-gray-400 dark:bg-gray-400 hover:bg-neutral-900 dark:hover:bg-white transition-colors"
      aria-label="테마 변경"
    >
      {theme === "dark" ? (
        <span className="text-xl">🌞</span>
      ) : (
        <span className="text-xl">🌙</span>
      )}
    </button>
  );
}
