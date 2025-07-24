/**
 * File Name : components/chat/ChatMessageBubble
 * Description : 채팅 메시지 말풍선
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2025.07.14  임도헌   Created   ChatMessagesList에서 분리
 * 2025.07.16  임도헌   Modified  Telegram 스타일 말풍선 및 중앙 정렬
 * 2025.07.17  임도헌   Modified  시간/읽음 여부 말풍선 바깥으로 분리
 */
"use client";

import UserAvatar from "../common/UserAvatar";
import TimeAgo from "../common/TimeAgo";
import { ChatUser } from "@/types/chat";

interface ChatMessageBubbleProps {
  message: {
    id: number;
    payload: string;
    created_at: Date | string;
    isRead: boolean;
    user: ChatUser;
  };
  isOwnMessage: boolean;
  showAvatar: boolean;
  showTail: boolean;
}

export default function ChatMessageBubble({
  message,
  isOwnMessage,
  showAvatar,
  showTail,
}: ChatMessageBubbleProps) {
  return (
    <div
      className={`flex ${
        isOwnMessage ? "justify-end" : "justify-start"
      } items-end animate-fade-in`}
    >
      {/* 왼쪽 유저 아바타 */}
      {!isOwnMessage && (
        <div className="self-start w-12">
          {showAvatar && (
            <UserAvatar
              avatar={message.user.avatar}
              username={message.user.username}
              size="sm"
              showUsername={false}
            />
          )}
        </div>
      )}

      {/* 말풍선 + 시간/읽음 레이아웃 */}
      <div
        className={`flex ${
          isOwnMessage ? "flex-row-reverse" : "flex-row"
        } gap-1 items-end`}
      >
        {/* 말풍선 */}
        <div
          className={`relative max-w-[70%] ${!isOwnMessage ? "ml-2" : "mr-2"}`}
        >
          <div
            className={`relative p-3 rounded-2xl shadow text-sm
            ${
              isOwnMessage
                ? "bg-primary text-white"
                : "bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
            }`}
          >
            {message.payload}

            {/* 꼬리 */}
            {showTail && (
              <span
                className={`absolute w-3 h-3 bg-inherit rounded-br
              ${
                isOwnMessage
                  ? "right-[-6px] top-1/2 transform -translate-y-1/2 rotate-45"
                  : "left-[-6px] top-1/2 transform -translate-y-1/2 rotate-45"
              }`}
              />
            )}
          </div>
        </div>

        {/* 시간 + 읽음 여부 */}
        <div
          className={`flex flex-col gap-0.5 text-xs text-neutral-700 dark:text-neutral-300 hover:text-neutral-800 dark:hover:text-neutral-400 ${
            isOwnMessage ? "items-start pr-1" : "items-end pl-1"
          }`}
        >
          {/* 읽음 여부 (내 메시지에만 표시) */}
          {isOwnMessage && <span>{message.isRead ? "읽음" : "안 읽음"}</span>}

          {/* 시간 표시 */}
          <TimeAgo date={message.created_at.toString()} />
        </div>
      </div>
    </div>
  );
}
