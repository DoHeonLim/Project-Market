/**
File Name : components/push-notification-toggle.tsx
Description : 푸시 알림 토글 컴포넌트
Author : 임도헌

History
Date        Author   Status    Description
2024.12.20  임도헌   Created
2024.12.20  임도헌   Modified  푸시 알림 토글 컴포넌트 추가
2024.12.29  임도헌   Modified  푸시 알림 토글 컴포넌트 스타일 수정
*/
"use client";

import { usePushNotification } from "@/hooks/usePushNotification";

export function PushNotificationToggle() {
  const { isSupported, isSubscribed, isPrivateMode, subscribe, unsubscribe } =
    usePushNotification();

  if (!isSupported) {
    return (
      <div className="text-sm text-gray-500 text-center sm:text-left">
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
        알림 {isSubscribed ? "켜짐" : "꺼짐"}
      </span>
      <button
        onClick={handleToggle}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 order-1 sm:order-2
          ${
            isSubscribed ? "bg-indigo-600" : "bg-gray-200 dark:bg-neutral-700"
          }`}
      >
        <span className="sr-only">
          푸시 알림 {isSubscribed ? "끄기" : "켜기"}
        </span>
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out
            ${isSubscribed ? "translate-x-6" : "translate-x-1"}`}
        />
      </button>
    </div>
  );
}
