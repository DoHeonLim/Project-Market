/**
 * File Name : components/chat/chatRoomCard/ChatRoomLastMessage
 * Description : 채팅방 마지막 메시지 표시 컴포넌트
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2025.07.15  임도헌   Created   마지막 메시지 컴포넌트 분리
 * 2025.07.24  임도헌   Modified  BoardPort 스타일 적용
 */
"use client";

import { ChatMessage } from "@/types/chat";

interface ChatRoomLastMessageProps {
  message?: ChatMessage;
}

export default function ChatRoomLastMessage({
  message,
}: ChatRoomLastMessageProps) {
  return (
    <p className="text-sm ml-2 text-neutral-500 dark:text-neutral-400 truncate max-w-full">
      {message?.payload || "메시지가 없습니다."}
    </p>
  );
}
