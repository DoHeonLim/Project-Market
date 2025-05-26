/**
File Name : components/providers/ThemeProvider
Description : 시스템 테마 설정 컴포넌트
Author : 임도헌

History
Date        Author   Status    Description
2024.12.13  임도헌   Created
*/
"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

interface ThemeProviderProps {
  children: React.ReactNode;
  [key: string]: any;
}

export default function ThemeProvider({
  children,
  ...props
}: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
