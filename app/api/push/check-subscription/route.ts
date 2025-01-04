/**
File Name : app/api/push/check-subscription/route.ts
Description : 푸시 알림 구독 확인 API
Author : 임도헌

History
Date        Author   Status    Description
2024.12.31  임도헌   Created
2024.12.31  임도헌   Modified  푸시 알림 구독 확인 API 추가
*/
import db from "@/lib/db";
import getSession from "@/lib/session";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session.id) {
      return Response.json({ isValid: false });
    }
    const { endpoint } = await req.json();

    // endpoint와 userId의 조합으로 구독 찾기
    const subscription = await db.pushSubscription.findFirst({
      where: {
        AND: [{ endpoint }, { userId: session.id }],
      },
    });

    // 구독이 존재하면 true, 없으면 false 반환
    return Response.json({ isValid: !!subscription });
  } catch (error) {
    console.error("Error checking subscription:", error);
    return Response.json({ isValid: false });
  }
}
