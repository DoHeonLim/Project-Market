/**
 * File Name : app/(tabs)/profile/notifications/page
 * Description : 알림 설정 페이지 (NotificationPreferences + 푸시 구독)
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2025.11.29  임도헌   Created   알림 설정 전용 페이지 추가
 * 2025.12.03  임도헌   Modified  stream 알림 추가
 */

import { redirect } from "next/navigation";
import getSession from "@/lib/session";
import db from "@/lib/db";
import NotificationSettingsClient from "@/components/notification/NotificationSettingsClient";

export default async function NotificationSettingsPage() {
  const session = await getSession();
  if (!session.id) {
    // 로그인 필요
    redirect("/login?callbackUrl=/profile/notifications");
  }

  const userId = session.id;

  // 존재하지 않으면 기본값으로 한 번 생성해 두고 불러오기
  const prefs = await db.notificationPreferences.upsert({
    where: { userId },
    update: {},
    create: {
      userId,
      chat: true,
      trade: true,
      review: true,
      badge: true,
      stream: true,
      system: true,
      pushEnabled: true,
    },
  });

  return (
    <main className="min-h-screen bg-white dark:bg-neutral-900">
      <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:py-8">
        <header className="mb-6">
          <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-50">
            알림 설정
          </h1>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            보트포트에서 받을 알림 종류와 시간대를 자유롭게 조절할 수 있어요.
          </p>
        </header>

        <NotificationSettingsClient prefs={prefs} />
      </div>
    </main>
  );
}
