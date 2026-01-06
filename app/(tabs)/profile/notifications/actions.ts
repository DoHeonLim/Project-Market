/**
 * File Name : app/profile/notifications/actions
 * Description : 알림 설정 업데이트 서버 액션 (알림 종류/방해금지 시간)
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2025.11.29  임도헌   Created   NotificationPreferences 업데이트 액션 추가
 * 2025.12.21  임도헌   Modified  pushEnabled는 푸시 토글(subscribe/unsubscribe)에서만 관리,
 *                                본 액션에서는 알림 종류/방해금지 시간만 저장하도록 정리
 * 2025.12.28  임도헌   Modified  preferences 레코드가 없을 때도 안전하도록 upsert로 변경
 */

"use server";

import db from "@/lib/db";
import getSession from "@/lib/session";

type ActionResult = {
  ok: boolean;
  error?: string;
};

export async function updateNotificationPreferences(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  try {
    const session = await getSession();
    if (!session.id) {
      return { ok: false, error: "UNAUTHORIZED" };
    }

    const userId = session.id;

    const toBool = (name: string) => formData.get(name) === "on";

    const chat = toBool("chat");
    const trade = toBool("trade");
    const review = toBool("review");
    const badge = toBool("badge");
    const stream = toBool("stream");
    const system = toBool("system");

    const quietHoursStart = (formData.get("quietHoursStart") as string) || null;
    const quietHoursEnd = (formData.get("quietHoursEnd") as string) || null;

    await db.notificationPreferences.upsert({
      where: { userId },
      update: {
        chat,
        trade,
        review,
        badge,
        stream,
        system,
        quietHoursStart,
        quietHoursEnd,
      },
      create: {
        userId,
        chat,
        trade,
        review,
        badge,
        stream,
        system,
        quietHoursStart,
        quietHoursEnd,
        // pushEnabled는 여기서 관리하지 않는다(토글 API가 SSOT)
        // - create 시에는 schema default(true) 적용
      },
    });

    return { ok: true };
  } catch (e) {
    console.error("[notifications] update failed:", e);
    return { ok: false, error: "INTERNAL_ERROR" };
  }
}
