/**
File Name : components/notification-listener.tsx
Description : 푸시 알림 리스너 컴포넌트
Author : 임도헌

History
Date        Author   Status    Description
2024.12.22  임도헌   Created
2024.12.22  임도헌   Modified  푸시 알림 리스너 컴포넌트 추가
*/

"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export default function NotificationListener({ userId }: { userId: number }) {
  useEffect(() => {
    const channel = supabase.channel("notifications");

    channel
      .on("broadcast", { event: "notification" }, ({ payload }) => {
        // 내가 받는 알림인 경우에만 토스트 표시
        if (payload.userId === userId) {
          toast(payload.title, {
            description: payload.body,
            action: payload.link
              ? {
                  label: "보기",
                  onClick: () => (window.location.href = payload.link),
                }
              : undefined,
          });
        }
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [userId]);

  return null;
}
