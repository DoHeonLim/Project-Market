/**
 * File Name : components/stream/StreamChatRoom
 * Description : 스트리밍 채팅방 컴포넌트(Topbar 이벤트로 열고 닫기 위임)
 * Author : 임도헌
 *
 * History
 * 2024.11.21  임도헌   Created
 * 2024.11.21  임도헌   Modified  스트리밍 채팅방 컴포넌트
 * 2024.11.23  임도헌   Modified  스크롤 및 useRef로 최신 메시지 수신 시 하단 고정
 * 2024.12.08  임도헌   Modified  시간 표시 클라이언트로 변경
 * 2024.12.19  임도헌   Modified  supabase 클라이언트 코드 lib로 이동
 * 2025.07.31  임도헌   Modified  useStreamChatSubscription 훅 적용
 * 2025.08.23  임도헌   Modified  낙관 제거: 서버 저장 성공 → 브로드캐스트 → 구독으로 렌더
 * 2025.09.05  임도헌   Modified  바닥일 때만 자동 스크롤로 변경
 * 2025.09.06  임도헌   Modified  RATE_LIMITED 시 2초 동안 전송 버튼 잠깐 비활성화
 * 2025.09.09  임도헌   Modified  초기 스크롤 맨 아래, 중복 메시지 방지(Set),
 *                               쿨다운 자동 해제 타이머, a11y(role=log),
 *                               전송 버튼 aria-label/문구 수정
 * 2025.09.30  임도헌   Modified  데스크톱/모바일 UI 정리
 * 2025.11.16  임도헌   Modified  라이트/다크 테마 스타일 개편 + Topbar 이벤트로 열고 닫기
 * 2025.11.16  임도헌   Modified  레이아웃 유연화: 부모 컨테이너 높이를 채울 수 있게 옵션/클래스 지원, 카메라 아이콘 Host 뱃지로 대체
 * 2025.11.21  임도헌   Modified  채널 중복 사용 제거
 * 2025.11.22  임도헌   Modified  내 클라이언트에 한해 낙관 렌더 재도입
 */

"use client";

import { useRef, useEffect, useState } from "react";
import { toast } from "sonner";
import type { RealtimeChannel } from "@supabase/supabase-js";
import type { StreamChatMessage } from "@/types/chat";
import { useStreamChatSubscription } from "@/hooks/useStreamChatSubscription";
import { sendStreamMessageAction } from "@/app/streams/[id]/actions";
import UserAvatar from "../common/UserAvatar";
import TimeAgo from "@/components/common/TimeAgo";
import {
  PaperAirplaneIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
} from "@heroicons/react/24/solid";

interface Props {
  initialStreamMessage: StreamChatMessage[]; // 최근 20개, ASC 정렬
  streamChatRoomId: number;
  streamChatRoomhost: number; // 방송자 userId
  userId: number;
  username: string; // 내 유저명 (fallback)

  /** (모바일/본문영역) 부모 높이를 꽉 채워야 할 때 true */
  fillParent?: boolean;
  /** 바깥 래퍼에 추가 클래스(선택) */
  containerClassName?: string;

  /** 모바일 전용: 채팅 확대/축소 토글 */
  onToggleExpand?: () => void;
  isExpanded?: boolean;
  showExpandToggle?: boolean;
}

const MAX_ITEMS = 500;

export default function StreamChatRoom({
  initialStreamMessage,
  streamChatRoomId,
  streamChatRoomhost,
  userId,
  username,
  fillParent = false,
  containerClassName = "",
  onToggleExpand,
  isExpanded,
  showExpandToggle = false,
}: Props) {
  /** 메시지/입력 상태 */
  const [messages, setMessages] =
    useState<StreamChatMessage[]>(initialStreamMessage);
  const [message, setMessage] = useState("");

  /** UI/스크롤 상태 */
  const chatRef = useRef<HTMLDivElement | null>(null);
  const atBottomRef = useRef<boolean>(true);
  const seenIdsRef = useRef<Set<string | number>>(new Set());
  const [cooldownUntil, setCooldownUntil] = useState<number>(0);

  /** 열림/닫힘 — Topbar가 제어 (기본 true) */
  const [isOpen, setIsOpen] = useState(true);

  // 다른 인스턴스/Topbar에서 보낸 상태 변경 이벤트를 구독
  useEffect(() => {
    const handleState = (event: Event) => {
      const { detail } = event as CustomEvent<{ open?: boolean }>;
      if (typeof detail?.open === "boolean") {
        setIsOpen(detail.open);
      }
    };

    window.addEventListener("stream:chat:state", handleState as EventListener);

    return () => {
      window.removeEventListener(
        "stream:chat:state",
        handleState as EventListener
      );
    };
  }, []);

  /** 최초 메시지/스크롤 초기화 */
  useEffect(() => {
    setMessages(initialStreamMessage);
    const s = new Set<string | number>();
    for (const m of initialStreamMessage) s.add(m.id);
    seenIdsRef.current = s;
    atBottomRef.current = true;
    requestAnimationFrame(() => {
      const el = chatRef.current;
      if (el) el.scrollTop = el.scrollHeight;
    });
  }, [streamChatRoomId, initialStreamMessage]);

  /** 전송용 채널 */
  const sendChannelRef = useRef<RealtimeChannel | null>(null);

  /** 스크롤 바닥 여부 추적 */
  useEffect(() => {
    const el = chatRef.current;
    if (!el) return;
    const onScroll = () => {
      const threshold = 16;
      atBottomRef.current =
        el.scrollHeight - el.scrollTop - el.clientHeight <= threshold;
    };
    onScroll();
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  /** 새 메시지 수신 시 바닥일 때만 자동 스크롤 */
  useEffect(() => {
    if (!chatRef.current || !atBottomRef.current) return;
    requestAnimationFrame(() => {
      const el = chatRef.current!;
      el.scrollTop = el.scrollHeight;
    });
  }, [messages]);

  /** 쿨다운 자동 해제 */
  useEffect(() => {
    if (!cooldownUntil) return;
    const ms = cooldownUntil - Date.now();
    if (ms <= 0) {
      setCooldownUntil(0);
      return;
    }
    const t = setTimeout(() => setCooldownUntil(0), ms);
    return () => clearTimeout(t);
  }, [cooldownUntil]);

  /** 실시간 구독(브로드캐스트 수신) */
  const sendChannel = useStreamChatSubscription({
    streamChatRoomId,
    userId,
    ignoreSelf: false,
    onReceive: (msg: StreamChatMessage) => {
      if (seenIdsRef.current.has(msg.id)) return;
      seenIdsRef.current.add(msg.id);
      setMessages((prev) => {
        const merged = [...prev, msg];
        return merged.length > MAX_ITEMS
          ? merged.slice(merged.length - MAX_ITEMS)
          : merged;
      });
    },
  });

  // 훅에서 생성한 채널을 전송용 ref로 공유
  useEffect(() => {
    if (sendChannel) {
      sendChannelRef.current = sendChannel;
    }
  }, [sendChannel]);

  /** 전송 */
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (Date.now() < cooldownUntil) return;

    const text = message.trim();
    if (!text) {
      toast.error("메시지를 입력해주세요.");
      return;
    }

    try {
      const res = await sendStreamMessageAction(text, streamChatRoomId);
      if (!res.success) {
        const ERR_MAP: Record<string, string> = {
          NOT_LOGGED_IN: "로그인이 필요합니다.",
          EMPTY_MESSAGE: "메시지를 입력해주세요.",
          MESSAGE_TOO_LONG: "메시지가 너무 깁니다. (최대 2000자)",
          RATE_LIMITED:
            "메시지를 너무 빠르게 보내고 있어요. 잠시 후 다시 시도해주세요.",
          CREATE_FAILED:
            "메시지 전송에 실패했습니다. 잠시 후 다시 시도해주세요.",
        };
        toast.error(ERR_MAP[res.error] ?? "메시지 전송 실패");
        if (res.error === "RATE_LIMITED") {
          setCooldownUntil(Date.now() + 2000);
        }
        return;
      }

      const sent = res.message;

      // 1) 로컬에 먼저 추가 + seenIds에 등록해둔다 (이후 브로드캐스트 중복 방지)
      setMessages((prev) => {
        const next = [...prev, sent];
        seenIdsRef.current.add(sent.id);

        if (next.length > MAX_ITEMS) {
          return next.slice(next.length - MAX_ITEMS);
        }
        return next;
      });

      // 2) 다른 클라이언트에게 브로드캐스트
      await sendChannelRef.current?.send({
        type: "broadcast",
        event: "message",
        payload: sent,
      });

      // 3) 입력창 리셋
      setMessage("");
    } catch (err) {
      console.error("메시지 전송 실패", err);
      toast.error("네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    }
  };

  /** ---- Topbar 연동: 이벤트 버스 ---- */
  // Topbar가 보내는 "채팅 열기" 이벤트 수신
  useEffect(() => {
    const onOpen = () => {
      setIsOpen(true);
      window.dispatchEvent(
        new CustomEvent("stream:chat:state", { detail: { open: true } })
      );
    };
    window.addEventListener("stream:chat:open", onOpen);
    // 최초 진입 시 상태 동기화(열림)
    window.dispatchEvent(
      new CustomEvent("stream:chat:state", { detail: { open: true } })
    );
    return () => window.removeEventListener("stream:chat:open", onOpen);
  }, []);

  // 닫기(헤더 버튼에서 호출)
  const closeChat = () => {
    setIsOpen(false);
    window.dispatchEvent(
      new CustomEvent("stream:chat:state", { detail: { open: false } })
    );
  };

  /** 전송 버튼 disabled 조건 */
  const sendDisabled =
    Date.now() < cooldownUntil || message.trim().length === 0;

  /** 닫힘 상태면 렌더X — Topbar에서 "채팅 열기" 버튼만 노출 */
  if (!isOpen) return null;

  return (
    <div
      className={[
        "flex flex-col min-h-0 rounded-xl border bg-white text-neutral-900 shadow-lg",
        "dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100",
        "overflow-hidden max-h-full",
        "xl:h-[calc(100vh-96px)]",
        // fillParent면 부모 높이 꽉 채우되, 위 max-h 제한 안에서만
        fillParent ? "h-full flex-1" : "sm:min-h-[40vh]",
        containerClassName,
      ].join(" ")}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b bg-neutral-50 text-neutral-800 dark:border-neutral-800 dark:bg-neutral-900/60 dark:text-neutral-100 rounded-t-xl">
        <div className="text-sm md:text-base font-semibold">채팅</div>
        <div className="flex items-center gap-2">
          {showExpandToggle && (
            <button
              type="button"
              onClick={onToggleExpand}
              className="inline-flex xl:hidden items-center justify-center rounded-md bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-800 dark:hover:bg-neutral-700 px-2 py-1 text-xs transition-colors"
              aria-label={isExpanded ? "채팅 축소" : "채팅 확대"}
              title={isExpanded ? "채팅 축소" : "채팅 확대"}
            >
              {isExpanded ? (
                <ArrowsPointingInIcon className="h-4 w-4" />
              ) : (
                <ArrowsPointingOutIcon className="h-4 w-4" />
              )}
            </button>
          )}
          <button
            onClick={closeChat}
            className="text-xs md:text-sm px-2 py-1 rounded-md bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-800 dark:hover:bg-neutral-700 transition-colors"
            title="채팅 닫기"
            aria-label="채팅 닫기"
          >
            닫기
          </button>
        </div>
      </div>

      {/* Log */}
      <div
        ref={chatRef}
        role="log"
        aria-live="polite"
        aria-relevant="additions"
        className="flex-1 min-h-0 overflow-auto px-3 py-3 space-y-3 scrollbar bg-white dark:bg-neutral-900"
      >
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-neutral-400 dark:text-neutral-500 text-sm md:text-base">
            아직 채팅이 없습니다.
          </div>
        ) : (
          messages.map((msg) => {
            const mine = msg.userId === userId;
            const host = msg.userId === streamChatRoomhost;

            const avatarUrl = msg.user?.avatar ?? null;
            const uname = msg.user?.username ?? (mine ? username : "익명");

            const AvatarEl = (
              <UserAvatar
                avatar={avatarUrl}
                username={uname}
                showUsername={false}
                size="sm"
                disabled
                className="p-0"
              />
            );

            return (
              <div
                key={msg.id}
                className={`flex w-full items-start gap-2 ${mine ? "justify-end" : "justify-start"}`}
              >
                {/* 상대 메시지 → 아바타 왼쪽 */}
                {!mine && <div className="flex-shrink-0">{AvatarEl}</div>}

                {/* 버블 */}
                <div
                  className={`max-w-[72%] md:max-w-[70%] flex flex-col ${mine ? "items-end" : "items-start"}`}
                >
                  <div className="flex items-center gap-2 text-xs">
                    <span
                      className={`font-medium ${
                        mine
                          ? "text-indigo-600 dark:text-indigo-300"
                          : "text-emerald-700 dark:text-emerald-300"
                      }`}
                    >
                      {uname}
                      {host && (
                        <span className="ml-1 rounded bg-amber-500/20 px-1.5 py-0.5 text-[11px] font-semibold text-amber-700 dark:text-amber-300">
                          HOST
                        </span>
                      )}
                    </span>
                    <span className="text-[11px] text-neutral-400 dark:text-neutral-500">
                      <TimeAgo date={new Date(msg.created_at).toISOString()} />
                    </span>
                  </div>

                  <div
                    className={[
                      "mt-1 whitespace-pre-wrap break-words rounded-2xl px-3 py-2 text-sm md:text-[0.95rem] leading-tight",
                      mine
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100 border border-neutral-200 dark:border-neutral-700",
                    ].join(" ")}
                  >
                    {msg.payload}
                  </div>
                </div>

                {/* 내 메시지 → 아바타 오른쪽 */}
                {mine && <div className="flex-shrink-0">{AvatarEl}</div>}
              </div>
            );
          })
        )}
      </div>

      {/* Input: 모바일 sticky */}
      <form
        className="p-3 border-t bg-neutral-50 dark:bg-neutral-900/60 dark:border-neutral-800 sticky bottom-0 z-10 xl:static"
        onSubmit={onSubmit}
      >
        <div className="relative">
          <input
            required
            onChange={(e) => setMessage(e.target.value)}
            value={message}
            className="w-full h-10 md:h-12 rounded-lg bg-white text-neutral-900 placeholder:text-neutral-400 border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:border-neutral-700 dark:focus:ring-indigo-500 dark:focus:border-indigo-500 pr-12 px-3"
            type="text"
            name="message"
            autoComplete="off"
            placeholder="채팅을 입력해주세요 (Enter)"
            aria-label="채팅 메시지 입력"
          />
          <button
            type="submit"
            disabled={sendDisabled}
            aria-label="메시지 전송"
            title={sendDisabled ? "잠시 후 다시 시도하세요" : "메시지 전송"}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-neutral-100 disabled:opacity-50 dark:hover:bg-neutral-700"
          >
            <PaperAirplaneIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          </button>
        </div>
      </form>
    </div>
  );
}
