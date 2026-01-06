/**
 File Name : middleware
 Description : 미들웨어
 Author : 임도헌
 
 History
 Date        Author   Status    Description
 2024.10.08  임도헌   Created
 2024.10.08  임도헌   Modified  인증 미들웨어 추가
 2025.12.23  임도헌   Modified  비로그인 리다이렉트 파라미터 통일(/login?callbackUrl=...)
 */

import { NextRequest, NextResponse } from "next/server";

interface IRoutes {
  [key: string]: boolean;
}

const publicOnlyUrls: IRoutes = {
  "/": true,
  "/login": true,
  "/sms": true,
  "/create-account": true,
  "/github/start": true,
  "/github/complete": true,
  "/manifest.webmanifest": true,
  "/offline": true,
};

export async function middleware(request: NextRequest) {
  // iron-session이 쓰는 쿠키 이름: "user"
  const isLoggedIn = request.cookies.has("user");
  const isPublicOnly = !!publicOnlyUrls[request.nextUrl.pathname];

  // 1) 비로그인 + 보호된 페이지 -> /login?callbackUrl=...
  // - app 라우트 개별 redirect와 동일 파라미터로 통일
  // - query까지 포함해 복귀 가능하도록 구성
  if (!isLoggedIn && !isPublicOnly) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    const next = request.nextUrl.pathname + request.nextUrl.search;
    loginUrl.searchParams.set("callbackUrl", next);
    return NextResponse.redirect(loginUrl);
  }

  // 2) 로그인 + publicOnly 페이지 -> 제품 페이지로
  if (isLoggedIn && isPublicOnly) {
    return NextResponse.redirect(new URL("/products", request.url));
  }

  // 3) 나머지는 통과
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|manifest.json|manifest.webmanifest|sw.js|workbox-*.js|pwa-push.js|images).*)",
  ],
};
