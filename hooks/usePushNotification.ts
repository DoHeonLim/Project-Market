/**
File Name : hooks/usePushNotification
Description : 푸시 알림 커스텀 훅
Author : 임도헌

History
Date        Author   Status    Description
2024.12.20  임도헌   Created
2024.12.20  임도헌   Modified  푸시 알림 커스텀 훅 추가
2024.12.31  임도헌   Modified  푸시 알림 코드 리팩토링
*/
"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";

interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export function usePushNotification() {
  const [subscription, setSubscription] = useState<PushSubscriptionData | null>(
    null
  );
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isPrivateMode, setIsPrivateMode] = useState(false);
  const [serviceWorkerRegistration, setServiceWorkerRegistration] =
    useState<ServiceWorkerRegistration | null>(null);

  // 초기 지원 여부 설정
  useEffect(() => {
    const supported = checkSupport();
    setIsSupported(supported);
  }, []);

  // 구독 상태 확인
  useEffect(() => {
    if (!isSupported) return;

    let mounted = true;
    const controller = new AbortController();
    // 현재 구독 상태 확인
    const checkSubscription = async () => {
      try {
        // Private 모드 감지
        try {
          localStorage.setItem("test", "test");
          localStorage.removeItem("test");
          if (mounted) setIsPrivateMode(false);
        } catch (event) {
          console.log("Private browsing mode detected", event);
          if (mounted) setIsPrivateMode(true);
          return;
        }

        const registration = await navigator.serviceWorker.ready;
        if (!mounted) return;

        if (registration) {
          setServiceWorkerRegistration(registration);
          const subscription = await registration.pushManager.getSubscription();

          if (!mounted) return;
          // 서버 측 검증 로직 추가
          if (subscription) {
            try {
              // 서버에서 실제 구독 상태 확인
              const response = await fetch("/api/push/check-subscription", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ endpoint: subscription.endpoint }),
                signal: controller.signal,
              });

              if (!mounted) return;

              if (response.ok) {
                const { isValid } = await response.json();
                if (!mounted) return;

                setIsSubscribed(isValid);
                if (isValid) {
                  setSubscription(
                    subscription.toJSON() as PushSubscriptionData
                  );
                } else {
                  // 유효하지 않은 구독은 제거
                  await subscription.unsubscribe();
                }
              }
            } catch (error) {
              if (!mounted) return;
              console.error("Subscription validation failed:", error);
              setIsSubscribed(false);
            }
          } else {
            if (mounted) setIsSubscribed(false);
          }
        }
      } catch (error) {
        if (!mounted) return;
        console.error("Failed to check push subscription:", error);
        setIsSubscribed(false);
      }
    };

    checkSubscription();

    return () => {
      mounted = false;
      controller.abort(); // 진행 중인 fetch 요청 취소
    };
  }, [isSupported]);

  // 브라우저 지원 여부 확인
  const checkSupport = () => {
    try {
      const supported =
        "serviceWorker" in navigator &&
        "PushManager" in window &&
        "Notification" in window;
      console.log("Push API supported:", supported);
      return supported;
    } catch (error) {
      console.error("Support check failed:", error);
      return false;
    }
  };

  // 서비스 워커 등록
  const registerServiceWorker = async () => {
    try {
      const registration =
        await navigator.serviceWorker.register("/service-worker.js");
      console.log("Service Worker registered:", registration);
      return registration;
    } catch (error) {
      console.error("Service Worker registration failed:", error);
      return null;
    }
  };

  // 푸시 알림 구독
  const subscribe = async () => {
    try {
      if (isPrivateMode) {
        toast.error(
          "프라이빗 모드에서는 푸시 알림을 사용할 수 없습니다. 일반 모드로 전환해주세요."
        );
        return;
      }

      let registration = serviceWorkerRegistration;
      if (!registration) {
        registration = await registerServiceWorker();
        if (!registration) {
          throw new Error("Service Worker 등록에 실패했습니다.");
        }
        setServiceWorkerRegistration(registration);
      }

      // 푸시 알림 권한 요청 전에 사용자에게 설명
      toast.info(
        "푸시 알림을 활성화하면 새로운 메시지나 거래 알림을 받을 수 있습니다."
      );

      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        toast.error(
          "알림 권한이 거부되었습니다. 브라우저 설정에서 권한을 허용해주세요."
        );
        return;
      }

      // VAPID 키를 Uint8Array로 변환
      const convertedVapidKey = urlBase64ToUint8Array(
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
      );

      // 구독 생성
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey,
      });
      console.log("Push subscription created:", subscription);

      const subscriptionData = subscription.toJSON() as PushSubscriptionData;

      // 서버에 구독 정보 전송
      const response = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subscriptionData),
      });

      if (!response.ok) throw new Error("Failed to subscribe");

      setSubscription(subscriptionData);
      setIsSubscribed(true);
      toast.success("푸시 알림이 활성화되었습니다.");
    } catch (error) {
      console.error("Push subscription error:", error);
      if (error instanceof Error) {
        toast.error(`푸시 알림 설정 실패: ${error.message}`);
      } else {
        toast.error("푸시 알림 설정에 실패했습니다.");
      }
    }
  };

  // 푸시 알림 구독 해제
  const unsubscribe = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        // 서버에서 구독 정보 삭제
        await fetch("/api/push/unsubscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        });

        // 브라우저에서 구독 해제
        await subscription.unsubscribe();
      }

      setSubscription(null);
      setIsSubscribed(false);
      toast.success("푸시 알림이 비활성화되었습니다.");
    } catch (error) {
      console.error("Push unsubscription error:", error);
      toast.error("푸시 알림 해제에 실패했습니다.");
    }
  };

  return {
    isSupported,
    isSubscribed,
    isPrivateMode,
    subscription,
    subscribe,
    unsubscribe,
  };
}

// VAPID 키 변환 함수 추가
function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
