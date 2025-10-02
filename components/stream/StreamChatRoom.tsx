/**
 * File Name : components/stream/StreamChatRoom
 * Description : 스트리밍 채팅방 컴포넌트
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
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
 * 2025.09.30  임도헌   Modified  채팅 토글 버튼 추가, 데스크톱, 모바일 UI 변경
 */

"use client";

import { useRef, useEffect, useState } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import type { RealtimeChannel } from "@supabase/supabase-js";
import type { StreamChatMessage } from "@/types/chat";
import { useStreamChatSubscription } from "@/hooks/useStreamChatSubscription";
import { sendStreamMessageAction } from "@/app/streams/[id]/actions";
import TimeAgo from "../common/TimeAgo";
import { toast } from "sonner";
import {
  PaperAirplaneIcon,
  UserIcon,
  VideoCameraIcon,
} from "@heroicons/react/24/solid";
import Link from "next/link";

interface Props {
  initialStreamMessage: StreamChatMessage[]; // 최근 20개, ASC 정렬
  streamChatRoomId: number;
  streamChatRoomhost: number;
  userId: number;
  username: string;
}

const MAX_ITEMS = 500;

export default function StreamChatRoom({
  initialStreamMessage,
  streamChatRoomId,
  streamChatRoomhost,
  userId,
  username,
}: Props) {
  const [messages, setMessages] =
    useState<StreamChatMessage[]>(initialStreamMessage);
  const [message, setMessage] = useState("");
  const chatRef = useRef<HTMLDivElement | null>(null);
  const atBottomRef = useRef<boolean>(true);
  const seenIdsRef = useRef<Set<string | number>>(new Set());
  const [cooldownUntil, setCooldownUntil] = useState<number>(0);

  // UI state: PC에서 열기/닫기
  const [collapsed, setCollapsed] = useState<boolean>(false);

  // 초기 메시지 세팅
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

  // 전송 채널
  const sendChannelRef = useRef<RealtimeChannel | null>(null);
  useEffect(() => {
    const channel = supabase.channel(`room-${streamChatRoomId}`);
    sendChannelRef.current = channel;
    channel.subscribe();
    return () => {
      try {
        channel.unsubscribe();
      } catch {}
      try {
        supabase.removeChannel(channel);
      } catch {}
      sendChannelRef.current = null;
    };
  }, [streamChatRoomId]);

  // 스크롤 감지
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

  // 새 메시지 수신 시: 바닥일 때만 자동 스크롤
  useEffect(() => {
    if (!chatRef.current || !atBottomRef.current) return;
    requestAnimationFrame(() => {
      const el = chatRef.current!;
      el.scrollTop = el.scrollHeight;
    });
  }, [messages]);

  // 쿨다운 자동 해제 타이머
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

  // 실시간 수신 (기존 훅 사용)
  useStreamChatSubscription({
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

  // 전송
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (Date.now() < cooldownUntil) return;

    const text = message.trim();
    if (!text) {
      toast.error("메시지를 입력해주세요.");
      return;
    }

    try {
      // 1) 서버 저장 → 전체 메시지 객체 획득
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
        if (res.error === "RATE_LIMITED") setCooldownUntil(Date.now() + 2000);
        return;
      }

      // 2) 서버가 반환한 메시지를 그대로 브로드캐스트
      await sendChannelRef.current?.send({
        type: "broadcast",
        event: "message",
        payload: res.message,
      });

      // 3) 입력창 초기화 (렌더는 실시간 구독으로 처리)
      setMessage("");
    } catch (err) {
      console.error("메시지 전송 실패", err);
      toast.error("네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    }
  };

  const sendDisabled =
    Date.now() < cooldownUntil || message.trim().length === 0;

  if (collapsed) {
    return (
      <div className="w-full rounded-xl border border-neutral-700 bg-neutral-900 text-white p-3 shadow-lg">
        <button
          onClick={() => setCollapsed(false)}
          aria-expanded={false}
          className="w-full text-sm md:text-base px-3 py-2 rounded bg-neutral-800 hover:bg-neutral-700 transition-colors font-medium"
          title="채팅 열기"
        >
          💬 채팅 열기
        </button>
      </div>
    );
  }

  return (
    <div
      className="w-full flex flex-col rounded-xl border border-neutral-700 bg-neutral-900 text-white p-3 shadow-lg
         h-[calc(100vh-256px)] xl:h-[calc(100vh-96px)]"
    >
      <div className="flex items-center justify-between pb-2 border-b border-neutral-800 mb-2 px-1">
        <div className="text-sm md:text-base font-semibold">채팅</div>

        {/* 채팅 토글 버튼*/}
        <div>
          <button
            onClick={() => setCollapsed((v) => !v)}
            aria-expanded={!collapsed}
            className="text-sm px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700"
            title={collapsed ? "채팅 열기" : "채팅 닫기"}
          >
            {collapsed ? "열기" : "닫기"}
          </button>
        </div>
      </div>

      <div
        className={`flex-1 overflow-auto px-1 py-2 space-y-3 custom-scrollbar
          ${/* 모바일 고정높이: 화면에서 일정 영역 차지 */ ""} block md:block`}
        ref={chatRef}
        role="log"
        aria-live="polite"
        aria-relevant="additions"
      >
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-neutral-500 text-sm md:text-base">
            아직 채팅이 없습니다.
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 w-full ${
                msg.userId === userId ? "justify-end" : "justify-start"
              }`}
            >
              {/* Avatar */}
              <div className="flex-shrink-0">
                {msg.user?.avatar ? (
                  <div className="relative w-8 h-8">
                    {msg.userId === streamChatRoomhost && (
                      <VideoCameraIcon className="absolute -left-2 -top-1 w-4 h-4 text-yellow-400 z-10" />
                    )}
                    <Link
                      href={`/profile/${msg.user.username}`}
                      className="hover:opacity-80"
                    >
                      <Image
                        src={`${msg.user.avatar}/avatar`}
                        alt={msg.user.username}
                        width={32}
                        height={32}
                        className="rounded-full border border-neutral-700"
                      />
                    </Link>
                  </div>
                ) : (
                  <div className="relative w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center border border-neutral-700">
                    {msg.userId === streamChatRoomhost && (
                      <VideoCameraIcon className="absolute -left-2 -top-1 w-4 h-4 text-yellow-400 z-10" />
                    )}
                    <UserIcon className="w-4 h-4 text-neutral-400" />
                  </div>
                )}
              </div>

              {/* 메시지 텍스트 블록 */}
              <div
                className={`flex flex-col max-w-[70%] text-sm md:text-base leading-tight ${
                  msg.userId === userId ? "items-end" : "items-start"
                }`}
              >
                <div className="w-full flex items-center justify-start gap-2">
                  <span
                    className={`font-medium ${
                      msg.userId === userId
                        ? "text-indigo-400"
                        : "text-emerald-300"
                    }`}
                  >
                    {msg.user?.username ?? username}
                  </span>
                  <span className="text-xs text-neutral-500">
                    <TimeAgo date={new Date(msg.created_at).toISOString()} />
                  </span>
                </div>

                <div className="break-words whitespace-pre-wrap text-neutral-100">
                  {msg.payload}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 입력영역: 모바일용 고정바 형태 옵션 또는 데스크탑 */}
      <form className="mt-3" onSubmit={onSubmit}>
        <div className="relative">
          <input
            required
            onChange={(e) => setMessage(e.target.value)}
            value={message}
            className="w-full h-10 md:h-12 rounded-lg bg-neutral-800 placeholder:text-neutral-500 text-neutral-100 px-3 pr-12 border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full disabled:opacity-50"
          >
            <PaperAirplaneIcon className="w-5 h-5 text-indigo-400" />
          </button>
        </div>
      </form>
    </div>
  );
}
