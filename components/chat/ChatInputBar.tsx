/**
 * File Name : components/chat/ChatInputBar
 * Description : 채팅 입력창 컴포넌트
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2025.07.14  임도헌   Created   ChatMessagesList에서 분리
 * 2025.07.15  임도헌   Modified  UI 변경
 * 2025.07.16  임도헌   Modified  최소 채팅 기능에 맞춤
 * 2025.07.22  임도헌   Modified  입력값, 포커스 내부에서 완전 관리
 */
"use client";

import { PaperAirplaneIcon } from "@heroicons/react/24/solid";
import { useState, useEffect, useRef } from "react";

interface ChatInputBarProps {
  isSubmitting: boolean;
  onSubmit: (text: string) => void;
  autoFocus?: boolean;
}

export default function ChatInputBar({
  isSubmitting,
  onSubmit,
  autoFocus = false,
}: ChatInputBarProps) {
  const [text, setText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // 입력창에 항상 포커스 유지
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus, isSubmitting]); // isSubmitting false될 때도 포커스 복구

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || isSubmitting) return;

    onSubmit(trimmed);
    setText(""); // 전송 후 초기화
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center rounded-full border border-gray-300 dark:border-gray-700 px-4 py-2 bg-white/70 dark:bg-gray-800 focus-within:ring-2 focus-within:ring-primary"
    >
      <input
        ref={inputRef}
        type="text"
        placeholder="메세지 쓰기"
        autoFocus={autoFocus}
        name="message"
        className="flex-1 bg-transparent rounded-full outline-none text-gray-800 dark:text-white"
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={isSubmitting}
      />
      <button
        type="submit"
        aria-label="send_message"
        className="ml-2 rounded-full bg-blue-500 p-2 text-white hover:bg-blue-600 dark:bg-indigo-500 dark:hover:bg-indigo-600 transition-colors"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <PaperAirplaneIcon className="size-6 text-neutral-400" />
        ) : (
          <PaperAirplaneIcon className="size-6 text-yellow-400" />
        )}
      </button>
    </form>
  );
}
