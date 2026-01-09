/**
 * File Name : app/api/push/check-subscription/route
 * Description : 푸시 알림 구독 확인 API (전역 토글 + 현재 endpoint 활성 상태 검증)
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2024.12.31  임도헌   Created
 * 2024.12.31  임도헌   Modified  푸시 알림 구독 확인 API 추가
 * 2025.12.21  임도헌   Modified  isActive=true && pushEnabled!=false 일 때만 유효(true)로 판단
 * 2026.01.04  임도헌   Modified  Prisma Route Handler runtime=nodejs 명시
 */

import db from "@/lib/db";
import getSession from "@/lib/session";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session.id) {
      return Response.json({ isValid: false });
    }

    // endpoint 없을 시 예외 처리
    const { endpoint } = await req.json();
    if (!endpoint || typeof endpoint !== "string") {
      return Response.json({ isValid: false }, { status: 400 });
    }

    // 토글 상태는
    // 1) 이 기기 endpoint가 서버에서 활성 구독(isActive=true) 이고
    // 2) 전역 pushEnabled가 false가 아닐 때
    // 에만 true 로 본다.
    const [prefs, subscription] = await Promise.all([
      db.notificationPreferences.findUnique({
        where: { userId: session.id },
        select: { pushEnabled: true },
      }),
      db.pushSubscription.findFirst({
        where: {
          endpoint,
          userId: session.id,
          isActive: true,
        },
        select: { id: true },
      }),
    ]);

    const pushAllowed = prefs?.pushEnabled !== false; // prefs 없으면 기본 true
    return Response.json({ isValid: !!subscription && pushAllowed });
  } catch (error) {
    console.error("Error checking subscription:", error);
    return Response.json({ isValid: false });
  }
}
