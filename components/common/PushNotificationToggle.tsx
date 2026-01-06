/**
 * File Name : components/common/PushNotificationToggle
 * Description : 푸시 알림 토글 컴포넌트 (전역 ON/OFF)
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2024.12.20  임도헌   Created
 * 2024.12.20  임도헌   Modified  푸시 알림 토글 컴포넌트 추가
 * 2025.12.21  임도헌   Modified  기준 문구/동작 확정(훅 usePushNotification의 글로벌 OFF와 동기화)
 */

"use client";

import { usePushNotification } from "@/hooks/usePushNotification";

export function PushNotificationToggle() {
  const { isSupported, isSubscribed, isPrivateMode, subscribe, unsubscribe } =
    usePushNotification();

  if (!isSupported) {
    return (
      <div className="text-xs sm:text-sm text-gray-500 text-center sm:text-left">
        이 브라우저에서는 푸시 알림을 지원하지 않습니다.
      </div>
    );
  }

  if (isPrivateMode) {
    return (
      <div className="text-sm text-gray-500 text-center sm:text-left">
        프라이빗 모드에서는 푸시 알림을 사용할 수 없습니다.
      </div>
    );
  }

  const handleToggle = async () => {
    try {
      // OFF는 전역 OFF(서버 pushEnabled=false + 모든 구독 비활성)
      if (isSubscribed) {
        await unsubscribe();
      } else {
        await subscribe();
      }
    } catch (error) {
      console.error("Push notification toggle error:", error);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-center gap-3">
      <span className="text-xs text-gray-700 dark:text-gray-200 order-2 sm:order-1">
        푸시 알림 {isSubscribed ? "켜짐" : "꺼짐"}
      </span>

      <button
        type="button"
        onClick={handleToggle}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors
          focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2
          ${isSubscribed ? "bg-indigo-600" : "bg-neutral-700"}`}
        aria-pressed={isSubscribed}
        aria-label={`푸시 알림 ${isSubscribed ? "끄기" : "켜기"}`}
      >
        <span className="sr-only">
          푸시 알림 {isSubscribed ? "끄기" : "켜기"}
        </span>
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition
            ${isSubscribed ? "translate-x-6" : "translate-x-1"}`}
        />
      </button>
    </div>
  );
}
