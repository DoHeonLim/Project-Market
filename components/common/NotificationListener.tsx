/**
File Name : components/common/NotificationListener
Description : 푸시 알림 리스너 컴포넌트
Author : 임도헌

History
Date        Author   Status    Description
2024.12.22  임도헌   Created
2024.12.22  임도헌   Modified  푸시 알림 리스너 컴포넌트 추가
2025.01.12  임도헌   Modified  푸시 알림 이미지 추가
2025.07.24  임도헌   Modified  console.log(payload) 삭제
*/

"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import Image from "next/image";

export default function NotificationListener({ userId }: { userId: number }) {
  useEffect(() => {
    const channel = supabase.channel("notifications");

    channel
      .on("broadcast", { event: "notification" }, ({ payload }) => {
        if (payload.userId === userId) {
          toast(payload.title, {
            description: payload.body,
            icon: payload.image ? (
              <div className="relative h-6 w-6">
                <Image
                  src={payload.image}
                  alt=""
                  fill
                  sizes="24px"
                  className="rounded-full object-cover"
                  priority
                />
              </div>
            ) : undefined,
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
