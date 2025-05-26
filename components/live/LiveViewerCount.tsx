/**
 * File Name : components/live/LiveViewerCount
 * Description : 실시간 시청자 수 표시 컴포넌트 (Presence 기반)
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2025.05.19  임도헌   Created
 * 2025.05.19  임도헌   Modified  Supabase Presence 기반으로 기능 추가
 */

"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { RealtimeChannel } from "@supabase/supabase-js";

interface LiveViewerCountProps {
  streamId: number;
  me: number;
  className?: string;
}

export default function LiveViewerCount({
  streamId,
  me,
  className = "",
}: LiveViewerCountProps) {
  const [viewerCount, setViewerCount] = useState(0);
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!me) return;

    const channel = supabase.channel(`presence:livestream:${streamId}`, {
      config: {
        presence: {
          key: `viewer-${me}`, // 현재 로그인 사용자의 userId
        },
      },
    });

    channelRef.current = channel;

    // Presence 상태 업데이트 시 호출됨
    channel.on("presence", { event: "sync" }, () => {
      const state = channel.presenceState();
      const viewers = Object.keys(state).length;
      setViewerCount(viewers);
    });

    // 채널 구독 시작
    channel.subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        await channel.track({ user_id: me });

        await fetch(`/api/streams/${streamId}/viewers/join`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });
      }
    });

    const leave = async () => {
      await fetch(`/api/streams/${streamId}/viewers/leave`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      await channel.unsubscribe();
    };

    window.addEventListener("beforeunload", leave);

    return () => {
      leave();
      window.removeEventListener("beforeunload", leave);
    };
  }, [streamId, me]);

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
        <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500"></span>
      </div>
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {viewerCount}명 시청 중
      </span>
    </div>
  );
}
