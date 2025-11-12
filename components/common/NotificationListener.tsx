/**
 * File Name : components/common/NotificationListener
 * Description : 푸시 알림 리스너 컴포넌트
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2024.12.22  임도헌   Created
 * 2024.12.22  임도헌   Modified  푸시 알림 리스너 컴포넌트 추가
 * 2025.01.12  임도헌   Modified  푸시 알림 이미지 추가
 * 2025.07.24  임도헌   Modified  console.log(payload) 삭제
 * 2025.11.10  임도헌   Modified  유저 전용 채널/토스트 중복 억제/비가시 억제
 */
"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import Image from "next/image";

type NotiPayload = {
  userId: number;
  title: string;
  body: string;
  link?: string;
  image?: string;
  type?: "CHAT" | "TRADE" | "REVIEW" | "SYSTEM" | "BADGE";
};

export default function NotificationListener({ userId }: { userId: number }) {
  useEffect(() => {
    const channelName = `user-${userId}-notifications` as const;
    const channel = supabase.channel(channelName);

    channel
      .on("broadcast", { event: "notification" }, ({ payload }) => {
        const p = payload as Partial<NotiPayload>;
        if (p.userId !== userId) return;
        if (typeof document !== "undefined" && document.hidden) return;

        const toastId = `noti:${p.type ?? "SYSTEM"}:${p.link ?? ""}`;
        toast(p.title ?? "알림", {
          id: toastId,
          description: p.body ?? "",
          icon: p.image ? (
            <div className="relative h-6 w-6">
              <Image
                src={p.image}
                alt=""
                fill
                sizes="24px"
                className="rounded-full object-cover"
                priority
              />
            </div>
          ) : undefined,
          action: p.link
            ? { label: "보기", onClick: () => (window.location.href = p.link!) }
            : undefined,
        });
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [userId]);

  return null;
}
