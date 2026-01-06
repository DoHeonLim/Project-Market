/**
 * File Name : components/chat/ChatInputBar
 * Description : 채팅 입력창 컴포넌트 (textarea / IME 안전 / 중복 제출 방지 / 실패 시 복원)
 * Author : 임도헌
 *
 * Key Points
 * - textarea 기반: Enter=전송, Shift+Enter=줄바꿈
 * - IME(한글/일본어 등) 조합 중 Enter 전송 방지
 * - 초단간 중복 제출 방지(lastSubmitAtRef)
 * - 전송 중에도 입력은 가능(버튼만 disabled) → UX 끊김 방지
 * - 전송 실패 시 입력값 복원(사용자 작성 내용 보호)
 * - autoFocus 옵션: 마운트 및 제출 종료 시 포커스 복구
 *
 * History
 * Date        Author   Status    Description
 * 2025.07.14  임도헌   Created   ChatMessagesList에서 분리
 * 2025.07.15  임도헌   Modified  UI 변경
 * 2025.07.16  임도헌   Modified  최소 채팅 기능에 맞춤
 * 2025.07.22  임도헌   Modified  입력값, 포커스 내부에서 완전 관리
 * 2025.09.05  임도헌   Modified  IME 조합 중 Enter 전송 방지 + 초단간 중복 제출 방지
 * 2026.01.03  임도헌   Modified  textarea 전환(Enter=전송/Shift+Enter 줄바꿈),
 *                                전송 중 입력 허용(버튼만 비활성화),
 *                                전송 실패 시 텍스트 복원, autoFocus/포커스 복구 강화
 */

"use client";

import { PaperAirplaneIcon } from "@heroicons/react/24/solid";
import { useEffect, useRef, useState } from "react";

interface ChatInputBarProps {
  isSubmitting: boolean; // 전송 진행 상태 (상위에서 관리)
  onSubmit: (text: string) => Promise<void> | void; // 실패 시 throw(권장) 또는 reject
  autoFocus?: boolean;
}

export default function ChatInputBar({
  isSubmitting,
  onSubmit,
  autoFocus = false,
}: ChatInputBarProps) {
  /** 입력 값 */
  const [text, setText] = useState("");

  /** IME(한글 등) 조합 상태 */
  const [isComposing, setIsComposing] = useState(false);

  /** DOM ref */
  const inputRef = useRef<HTMLTextAreaElement>(null);

  /** 초단간 중복 제출 방지 */
  const lastSubmitAtRef = useRef<number>(0);

  /**
   * 제출 직전에 입력값 스냅샷 저장
   * - 전송 실패 시 복원하기 위해 사용
   */
  const pendingSnapshotRef = useRef<string>("");

  /**
   * autoFocus 처리
   * - 마운트 시 포커스
   * - isSubmitting이 false로 바뀌는 시점(전송 종료)에도 포커스 복구
   */
  useEffect(() => {
    if (!autoFocus) return;
    inputRef.current?.focus();
  }, [autoFocus, isSubmitting]);

  /**
   * "전송" 실행
   * - onSubmit이 실패를 throw/reject로 표현한다는 전제(권장)
   * - 성공 시: clear
   * - 실패 시: snapshot 복원
   */
  const submit = async () => {
    // 1) IME 조합 중이면 제출 금지
    if (isComposing) return;

    // 2) 전송 중이면 제출 금지
    if (isSubmitting) return;

    // 3) 빈 문자열 금지
    const trimmed = text.trim();
    if (!trimmed) return;

    // 4) 초단간 중복 제출 방지
    const now = Date.now();
    if (now - lastSubmitAtRef.current < 300) return;
    lastSubmitAtRef.current = now;

    // 5) 실패 대비 스냅샷 저장 후 optimistic clear
    pendingSnapshotRef.current = text;
    setText("");

    try {
      await onSubmit(trimmed);

      // 성공: snapshot 비움(명시)
      pendingSnapshotRef.current = "";
    } catch (err) {
      // 실패: 입력 복원
      setText(pendingSnapshotRef.current);
      pendingSnapshotRef.current = "";

      // 포커스 복구
      requestAnimationFrame(() => inputRef.current?.focus());

      throw err; // 상위에서 토스트 등을 띄우고 싶으면 유지
    }
  };

  /**
   * Enter=전송 / Shift+Enter=줄바꿈
   * - IME 조합 중 Enter는 전송이 아니라 조합 확정 용도로 쓰일 수 있어 방어
   */
  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key !== "Enter") return;

    // IME 조합 중 Enter는 submit으로 처리하지 않음
    if (isComposing) {
      e.preventDefault();
      return;
    }

    // Shift+Enter는 줄바꿈 허용
    if (e.shiftKey) return;

    // Enter 단독 → 전송
    e.preventDefault();
    void submit();
  };

  const isSendDisabled = isSubmitting || text.trim().length === 0;

  return (
    <div
      className="
        flex items-end gap-2
        rounded-full border border-gray-300 dark:border-gray-700
        px-3 py-1.5
        bg-white/70 dark:bg-gray-800
        focus-within:ring-2 focus-within:ring-primary
        sm:px-4 sm:py-2
      "
    >
      <textarea
        ref={inputRef}
        name="message"
        placeholder="메세지 쓰기"
        rows={1}
        className="
          flex-1 bg-transparent outline-none resize-none
          text-sm sm:text-base
          text-gray-800 dark:text-white
          leading-5
          py-1
        "
        value={text}
        onChange={(e) => setText(e.target.value)}
        onCompositionStart={() => setIsComposing(true)}
        onCompositionEnd={() => setIsComposing(false)}
        onKeyDown={onKeyDown}
        /**
         * 전송 중에도 입력은 허용한다(UX 끊김 방지).
         * - 버튼만 disabled 처리.
         */
        disabled={false}
      />

      <button
        type="button"
        aria-label="send_message"
        onClick={() => void submit()}
        disabled={isSendDisabled}
        className="
          flex items-center justify-center
          rounded-full
          p-2 sm:p-2.5
          bg-blue-500 text-white hover:bg-blue-600
          dark:bg-indigo-500 dark:hover:bg-indigo-600
          transition-colors
          disabled:opacity-60 disabled:cursor-not-allowed
        "
      >
        <PaperAirplaneIcon className="size-6 text-white opacity-90" />
      </button>
    </div>
  );
}
