// 2024.11.23  임도헌 tailwind 스크롤 바 커스텀

import type { Config } from "tailwindcss";
import formsPlugin from "@tailwindcss/forms";
import scrollbarPlugin from "tailwind-scrollbar";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {},
  plugins: [formsPlugin, scrollbarPlugin({ nocompatible: true })],
};

export default config;
