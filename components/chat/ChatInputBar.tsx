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
 * 2025.09.05  임도헌   Modified  IME 조합 중 Enter 전송 방지 + 초단간 중복 제출 방지
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
  const [isComposing, setIsComposing] = useState(false); // IME(한글 등) 조합 상태
  const inputRef = useRef<HTMLInputElement>(null);
  const lastSubmitAtRef = useRef<number>(0); // 중복 제출 방지용

  // 입력창에 항상 포커스 유지
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus, isSubmitting]); // isSubmitting false될 때도 포커스 복구

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = text.trim();

    // IME 조합 중이면 전송 금지 (엔터가 눌려도 제출 막기)
    if (isComposing) return;

    // 중복 제출 방지 + 외부 isSubmitting으로 이중 방어
    const now = Date.now();
    if (now - lastSubmitAtRef.current < 300) return;
    if (!trimmed || isSubmitting) return;

    lastSubmitAtRef.current = now;
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
        onCompositionStart={() => setIsComposing(true)} // 한글 조합 시작
        onCompositionEnd={() => setIsComposing(false)} // 한글 조합 종료
        onKeyDown={(e) => {
          // 조합 중 Enter가 눌리면 폼 제출 막기
          if (e.key === "Enter" && isComposing) {
            e.preventDefault();
          }
        }}
        disabled={isSubmitting}
      />
      <button
        type="submit"
        aria-label="send_message"
        className="ml-2 rounded-full bg-blue-500 p-2 text-white hover:bg-blue-600 dark:bg-indigo-500 dark:hover:bg-indigo-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        disabled={isSubmitting || text.trim().length === 0} // 빈 문자열/전송중 비활성화
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
