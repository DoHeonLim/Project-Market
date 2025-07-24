/**
 * File Name : components/chat/chatRoomCard/ChatRoomUnreadBadge
 * Description : 채팅방 안 읽은 메시지 뱃지 컴포넌트
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2025.07.15  임도헌   Created   읽지 않은 메시지 뱃지 분리
 * 2025.07.17  임도헌   Modified  시간과 뱃지 따로 처리
 */
"use client";

import TimeAgo from "@/components/common/TimeAgo";

interface ChatRoomUnreadBadgeProps {
  count: number;
  date: string;
}

export default function ChatRoomUnreadBadge({
  count,
  date,
}: ChatRoomUnreadBadgeProps) {
  if (count <= 0) {
    return (
      <p className="text-xs text-muted-foreground whitespace-nowrap">
        <TimeAgo date={date} />
      </p>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1 min-w-[48px]">
      <span
        className="bg-rose-600 text-white text-xs px-2 py-0.5 rounded-full
        font-semibold shadow-sm"
      >
        {count}
      </span>
      <p className="text-[10px] text-muted-foreground whitespace-nowrap">
        <TimeAgo date={date} />
      </p>
    </div>
  );
}
