import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ThemeProvider from "@/components/providers/ThemeProvider";
import { Toaster } from "sonner";
import NotificationListener from "@/components/notification-listener";
import getSession from "@/lib/session";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#1E40AF",
};

export const metadata: Metadata = {
  title: {
    template: "%s | 보드포트",
    default: "보드포트 - 모든 게임이 모이는 곳",
  },
  description: "보드게임과 TRPG 중고거래 및 커뮤니티 플랫폼 보드포트입니다.",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/images/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/images/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/images/favicon-96x96.png", sizes: "96x96", type: "image/png" },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "보드포트",
  },
  formatDetection: {
    telephone: false,
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  if (typeof window !== "undefined" && "serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("/sw.js");
    });
  }
  const session = await getSession();
  return (
    <html lang="ko" suppressHydrationWarning>
      <body
        className={`${inter.className} 
          relative min-h-[100dvh] w-full
          bg-background dark:bg-background-dark 
          text-text dark:text-text-dark
          transition-colors duration-300
          sm:max-w-screen-sm sm:mx-auto sm:shadow-xl
          pb-[env(safe-area-inset-bottom)]`}
      >
        <Toaster />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {session.id && <NotificationListener userId={session.id} />}
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
