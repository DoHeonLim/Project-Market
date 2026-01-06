/**
 * File Name : components/notification/NotificationSettingsClient
 * Description : 알림 설정 클라이언트 폼 컴포넌트 (푸시 토글 + 알림 종류/시간대)
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2025.11.29  임도헌   Created   알림 종류/시간대 UI 및 저장 로직 구현
 * 2025.11.29  임도헌   Modified  헤더/프로필 복귀 버튼 및 문구 단순화
 * 2025.12.03  임도헌   Modified  props에 stream 추가
 * 2025.12.21  임도헌   Modified  pushEnabled는 전역 푸시 토글로 분리,
 *                                폼에서는 알림 종류/방해금지 시간만 저장(푸시는 PushNotificationToggle로만 제어)
 */

"use client";

import { useFormState } from "react-dom";
import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PushNotificationToggle } from "@/components/common/PushNotificationToggle";
import { updateNotificationPreferences } from "@/app/(tabs)/profile/notifications/actions";

type NotificationPreferencesProps = {
  id: number;
  userId: number;
  chat: boolean;
  trade: boolean;
  review: boolean;
  badge: boolean;
  stream: boolean;
  system: boolean;
  quietHoursStart: string | null;
  quietHoursEnd: string | null;
};

type FormState = {
  ok: boolean;
  error?: string;
};

const initialState: FormState = { ok: false };

type Props = {
  prefs: NotificationPreferencesProps;
};

export default function NotificationSettingsClient({ prefs }: Props) {
  const router = useRouter();
  const [state, formAction] = useFormState(
    updateNotificationPreferences,
    initialState
  );

  useEffect(() => {
    if (!state) return;

    if (state.ok) {
      toast.success("알림 설정이 저장되었습니다.");
      router.push("/profile");
    } else if (state.error) {
      toast.error("알림 설정 저장에 실패했습니다. 잠시 후 다시 시도해주세요.");
    }
  }, [state, router]);

  return (
    <form
      action={formAction}
      className="mx-4 flex flex-col gap-6 py-4 text-left"
    >
      {/* 헤더 + 프로필로 돌아가기 */}
      <header className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-[17px] font-semibold text-neutral-900 dark:text-neutral-50">
            알림 설정
          </h1>
        </div>
        <Link
          href="/profile"
          className="btn-ghost text-[12px]"
          aria-label="내 프로필로 돌아가기"
        >
          프로필로 돌아가기
        </Link>
      </header>

      {/* 1. 푸시 알림 (전역 ON/OFF 토글) */}
      <section className="panel">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-2 p-2">
          <div className="flex flex-col m-auto min-w-0">
            <h2 className="text-[15px] font-semibold text-neutral-900 dark:text-neutral-50">
              푸시 알림
            </h2>
            <p className="mt-1 text-[9px] sm:text-sm text-neutral-600 dark:text-neutral-400">
              푸시 알림을 받을지 설정할 수 있어요.
            </p>
          </div>

          {/* 푸시 상태 (훅이 서버 전역 토글 + 현재 브라우저 구독까지 동기화) */}
          <div className="flex flex-col items-center justify-center m-auto text-right">
            <div className="inline-flex justify-end">
              <PushNotificationToggle />
            </div>
            <p className="mt-1 text-[9px] sm:text-sm text-neutral-500 dark:text-neutral-400">
              알림 권한 요청/해제를 포함해 자동으로 동기화돼요.
            </p>
          </div>
        </div>
      </section>

      {/* 2. 알림 종류 */}
      <section className="panel">
        <div className="px-4 py-3 border-b border-neutral-100 dark:border-neutral-800">
          <h2 className="text-[15px] font-semibold text-neutral-900 dark:text-neutral-50">
            알림 종류
          </h2>
          <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">
            필요 없는 알림은 꺼 두고, 중요한 알림만 골라서 받아보세요.
          </p>
        </div>

        <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
          {rows.map((row) => (
            <label
              key={row.name}
              className="flex items-center justify-between gap-4 px-4 py-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-8 w-8 rounded-xl bg-sky-50 dark:bg-neutral-800 flex items-center justify-center">
                  <span aria-hidden>{row.icon}</span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-neutral-900 dark:text-neutral-50">
                    {row.label}
                  </p>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400">
                    {row.description}
                  </p>
                </div>
              </div>

              <input
                type="checkbox"
                name={row.name}
                defaultChecked={
                  prefs[
                    row.name as keyof NotificationPreferencesProps
                  ] as boolean
                }
                className="h-4 w-4 rounded border-neutral-300 dark:border-neutral-600"
              />
            </label>
          ))}
        </div>
      </section>

      {/* 3. 방해 금지 시간대 */}
      <section className="panel">
        <div className="px-4 py-3 border-b border-neutral-100 dark:border-neutral-800">
          <h2 className="text-[15px] font-semibold text-neutral-900 dark:text-neutral-50">
            방해 금지 시간대
          </h2>
          <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">
            설정한 시간 동안에는 푸시 알림이 울리지 않아요. (중요 안내는 예외일
            수 있어요)
          </p>
        </div>

        <div className="px-4 py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1 text-xs text-neutral-700 dark:text-neutral-300">
            <p>
              예: <span className="font-medium">22:00 ~ 08:00</span> 으로
              설정하면 밤에는 알림이 뜨지 않아요.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <input
              type="time"
              name="quietHoursStart"
              defaultValue={prefs.quietHoursStart ?? ""}
              className="rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-2 py-1 text-xs"
            />
            <span className="text-neutral-500 dark:text-neutral-400">~</span>
            <input
              type="time"
              name="quietHoursEnd"
              defaultValue={prefs.quietHoursEnd ?? ""}
              className="rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-2 py-1 text-xs"
            />
          </div>
        </div>
      </section>

      {/* 저장 버튼 */}
      <div className="flex justify-end">
        <button
          type="submit"
          className="inline-flex items-center rounded-lg bg-neutral-900 text-white text-sm font-medium px-4 py-2 hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-white transition-colors"
        >
          설정 저장하기
        </button>
      </div>
    </form>
  );
}

const rows = [
  {
    name: "chat",
    label: "채팅 알림",
    icon: "💬",
    description: "새로운 메시지나 쪽지가 도착하면 알려드려요.",
  },
  {
    name: "trade",
    label: "거래 알림",
    icon: "⚓",
    description: "거래 요청, 상태 변경 등 중요한 거래 이벤트를 알려드려요.",
  },
  {
    name: "review",
    label: "리뷰 알림",
    icon: "⭐",
    description: "나에게 남겨진 거래 후기가 있을 때 알려드려요.",
  },
  {
    name: "badge",
    label: "뱃지 알림",
    icon: "🎖️",
    description: "새로운 항해 뱃지를 획득하면 바로 알려드려요.",
  },
  {
    name: "stream",
    label: "방송 알림",
    icon: "📺",
    description: "팔로우한 선원이 방송을 시작하면 바로 알려드려요.",
  },
  {
    name: "system",
    label: "시스템 알림",
    icon: "📢",
    description: "서비스 공지 및 중요한 안내를 받아볼 수 있어요.",
  },
] as const;
