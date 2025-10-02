/**
 File Name : middleware
 Description : 미들웨어
 Author : 임도헌
 
 History
 Date        Author   Status    Description
 2024.10.08  임도헌   Created
 2024.10.08  임도헌   Modified  인증 미들웨어 추가
 */

import { NextRequest, NextResponse } from "next/server";
import getSession from "./lib/session";

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
};

export async function middleware(request: NextRequest) {
  const session = await getSession();
  const exists = publicOnlyUrls[request.nextUrl.pathname];
  // 로그인 상태가 아니고
  if (!session.id) {
    // 허가되지 않은 사이트면 메인으로 리다이렉트한다.
    if (!exists) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  } else {
    // 로그인 했다면 제품 페이지로 이동한다.
    if (exists) {
      return NextResponse.redirect(new URL("/products", request.url));
    }
  }
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|manifest.json|sw.js|workbox-*.js|images).*)",
  ],
};
