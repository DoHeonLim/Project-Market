// 2024.11.23  임도헌 tailwind 스크롤 바 커스텀

import type { Config } from "tailwindcss";
import formsPlugin from "@tailwindcss/forms";
import scrollbarPlugin from "tailwind-scrollbar";

const config: Config = {
  darkMode: "class", // 다크 모드 설정
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#1E40AF", // 네이비 (신뢰/전문성)
          light: "#60A5FA", // 밝은 파랑
          dark: "#1E3A8A", // 어두운 네이비
        },
        secondary: {
          DEFAULT: "#60A5FA", // 블루 (자유/소통)
          light: "#93C5FD",
          dark: "#3B82F6",
        },
        accent: {
          DEFAULT: "#FCD34D", // 골드 (가치/특별함)
          light: "#FDE68A",
          dark: "#F59E0B",
        },
        background: {
          DEFAULT: "#FFFFFF", // 화이트 (깔끔함)
          dark: "#000000",
        },
        text: {
          DEFAULT: "#000000",
          dark: "#FFFFFF",
        },
      },
    },
  },
  plugins: [formsPlugin, scrollbarPlugin({ nocompatible: true })],
};

export default config;
