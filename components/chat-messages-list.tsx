/**
 File Name : components/chat-messages-list
 Description : 채팅 메시지 컴포넌트
 Author : 임도헌
 
 History
 Date        Author   Status    Description
 2024.11.01  임도헌   Created
 2024.11.08  임도헌   Modified  채팅 메시지 컴포넌트 추가
 2024.11.09  임도헌   Modified  supabase 채널 연결 및 실시간 채팅 기능 추가
 2024.11.15  임도헌   Modified  채팅 읽음 안읽음 추가 
 2024.11.21  임도헌   Modified  ChatroomId를 productChatRoomId으로 변경
 2024.12.07  임도헌   Modified  프로필 이미지 컴포넌트 분리
 2024.12.08  임도헌   Modified  시간 표시 컴포넌트 분리
 2024.12.12  임도헌   Modified  스타일 변경
 2024.12.19  임도헌   Modified  supabase 클라이언트 코드 lib로 이동
 2024.12.22  임도헌   Modified  메시지 저장 코드 변경(실시간 통신)
 2024.12.30  임도헌   Modified  스크롤 버그 수정
 2025.02.02  임도헌   Modified  신속한 교신병 뱃지 체크 추가(checkQuickResponseBadge)
 2025.04.18  임도헌   Modified  checkQuickResponseBadge를 server action으로 변경하고 불러오게 변경
 2025.05.10  임도헌   Modified  UI 개선
 */
"use client";

import {
  InitialChatMessages,
  saveMessage,
  readMessageUpdate,
  checkQuickResponseBadgeAction,
} from "@/app/chats/[id]/actions";
import { PaperAirplaneIcon } from "@heroicons/react/24/solid";
import { supabase } from "@/lib/supabase";
import { RealtimeChannel } from "@supabase/supabase-js";
import { useEffect, useRef, useState, useCallback } from "react";
import UserAvatar from "./user-avatar";
import TimeAgo from "./time-ago";
import Image from "next/image";
import { formatToWon } from "@/lib/utils";

interface IChatMessageListProps {
  initialMessages: InitialChatMessages;
  userId: number;
  productChatRoomId: string;
  username: string;
  avatar: string;
  product: {
    title: string;
    images: { url: string }[];
    price: number;
    purchase_userId: number | null;
    reservation_userId: number | null;
  };
}

export default function ChatMessagesList({
  initialMessages,
  userId,
  productChatRoomId,
  username,
  avatar,
  product,
}: IChatMessageListProps) {
  const [messages, setMessages] = useState(initialMessages);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const channel = useRef<RealtimeChannel>();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageCountRef = useRef(initialMessages.length); //메시지 갯수 추적
  const hasCheckedBadgeRef = useRef(false); //뱃지 체크 여부 추적

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const {
      target: { value },
    } = event;
    setMessage(value);
  };

  // 메시지 카운트가 100개 이상일 때만 뱃지 체크를 수행하는 함수
  const checkBadgeIfMessageCount100 = useCallback(async () => {
    if (messageCountRef.current >= 100 && !hasCheckedBadgeRef.current) {
      hasCheckedBadgeRef.current = true;
      await checkQuickResponseBadgeAction(userId);
    }
  }, [userId]);

  // 컴포넌트 마운트 시 한 번만 체크
  useEffect(() => {
    checkBadgeIfMessageCount100();
  }, [checkBadgeIfMessageCount100]);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (isSubmitting || !message.trim()) return;

    setIsSubmitting(true);
    setError(null);

    const newMessage = {
      id: Date.now(),
      payload: message,
      created_at: new Date(),
      userId,
      isRead: false,
      user: {
        username,
        avatar,
      },
    };

    try {
      await Promise.all([
        channel.current?.send({
          type: "broadcast",
          event: "message",
          payload: {
            ...newMessage,
            productChatRoomId,
          },
        }),
        saveMessage(message, productChatRoomId),
      ]);

      setMessages((prev) => [...prev, newMessage]);
      messageCountRef.current++;
      setMessage("");

      await checkBadgeIfMessageCount100();
    } catch (error) {
      setError("메시지 전송에 실패했습니다. 다시 시도해주세요.");
      console.error("메시지 전송 실패:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const client = supabase;
    channel.current = client.channel(`room-${productChatRoomId}`);
    channel.current
      .on("broadcast", { event: "message" }, async (payload) => {
        setMessages((prevMsgs) => {
          const isDuplicate = prevMsgs.some(
            (msg) => msg.id === payload.payload.id
          );
          if (isDuplicate) return prevMsgs;

          messageCountRef.current++;
          checkBadgeIfMessageCount100();
          return [...prevMsgs, payload.payload];
        });

        if (payload.payload.userId !== userId) {
          await readMessageUpdate(productChatRoomId, userId);
        }
      })
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          console.log("Connected to realtime channel");
        }
      });
    //user가 페이지를 떠나면 channel의 구독을 해제한다.
    return () => {
      channel.current?.unsubscribe();
    };
  }, [productChatRoomId, userId, checkBadgeIfMessageCount100]);

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({
          behavior: "smooth",
          block: "end",
        });
      }
    });
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      scrollToBottom();
    }, 100);

    return () => clearTimeout(timer);
  }, [messages, scrollToBottom]);

  // 상대방 정보 추출 (본인 제외)
  const otherUser = messages.find((msg) => msg.userId !== userId)?.user;

  return (
    <div className="flex flex-col h-screen bg-neutral-50/5 dark:bg-background-dark/30">
      {/* 상단바: 뒤로가기 + 유저 정보 + 제품 정보 */}
      <div className="fixed left-1/2 -translate-x-1/2 w-full max-w-screen-sm z-50 bg-neutral-200 dark:bg-neutral-800 border-b border-neutral-200/20 dark:border-primary-dark/30 backdrop-blur-sm">
        <div className="flex items-center gap-2 px-4 py-2 w-full flex-nowrap overflow-x-auto">
          <button
            onClick={() => window.history.back()}
            className="text-neutral-500 hover:text-neutral-300 flex-shrink-0"
            aria-label="뒤로가기"
          >
            <svg width="32" height="32" fill="none" viewBox="0 0 24 24">
              <path
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          {otherUser && (
            <UserAvatar
              avatar={otherUser.avatar}
              username={otherUser.username}
              size="md"
              showUsername={true}
              disabled={true}
            />
          )}
          <div className="relative size-12 flex-shrink-0 rounded-lg overflow-hidden border border-neutral-200/20 dark:border-primary-dark/30">
            <Image
              src={`${product.images[0]?.url}/avatar`}
              alt={product.title}
              fill
              className="object-cover"
            />
          </div>
          <div className="flex flex-col flex-1 min-w-0 gap-1">
            <div className="flex justify-center items-center gap-2 flex-wrap min-w-0">
              {product.purchase_userId ? (
                <span className="px-2 py-1 text-xs bg-neutral-500 text-white rounded-full truncate">
                  ⚓ 판매완료
                </span>
              ) : product.reservation_userId ? (
                <span className="px-2 py-1 text-xs bg-green-500 text-white rounded-full truncate">
                  🛞 예약중
                </span>
              ) : null}
              <span className="font-medium text-primary dark:text-secondary-light truncate text-sm sm:text-base">
                {product.title}
              </span>
              <span className="text-xs sm:text-sm font-medium text-accent dark:text-accent-light truncate">
                💰 {formatToWon(product.price)}원
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto mt-20">
        <div className="p-5 space-y-5">
          {messages.map((message, index) => (
            <div
              key={message.id}
              ref={index === messages.length - 1 ? messagesEndRef : undefined}
              className={`flex gap-3 items-start ${
                message.userId === userId ? "justify-end" : ""
              }`}
            >
              {message.userId === userId ? null : (
                <UserAvatar
                  avatar={message.user.avatar}
                  username={message.user.username}
                  size="sm"
                  showUsername={false}
                />
              )}
              <div
                className={`flex flex-col gap-1.5 max-w-[80%] ${
                  message.userId === userId ? "items-end" : "items-start mt-6"
                }`}
              >
                <div
                  className={`relative group ${
                    message.userId === userId ? "flex flex-row-reverse" : ""
                  }`}
                >
                  <span
                    className={`
                      p-3 rounded-2xl break-all whitespace-pre-line
                      ${
                        message.userId === userId
                          ? "bg-primary dark:bg-primary-dark text-white rounded-tr-none"
                          : "bg-neutral-400 dark:bg-white/20 text-neutral-800 dark:text-white rounded-tl-none"
                      }
                      border border-neutral-200/20 dark:border-primary-dark/30
                      backdrop-blur-sm
                      animate-fadeIn
                      w-full
                    `}
                  >
                    {message.payload}
                  </span>
                  <div
                    className={`absolute -z-10 size-3 rounded-full blur-sm opacity-30
                      ${
                        message.userId === userId
                          ? "bg-primary/50 dark:bg-primary-dark/50 -right-4"
                          : "bg-neutral-200/ dark:bg-white/ -left-4"
                      } top-2`}
                  />
                </div>
                <div
                  className={`flex text-xs text-neutral-500 dark:text-white gap-2 ${
                    message.userId === userId ? "flex-row-reverse" : "mt-2"
                  }`}
                >
                  <span className="text-xs">
                    {message.userId !== userId
                      ? null
                      : message.isRead === false
                        ? "안 읽음"
                        : "읽음"}
                  </span>
                  <TimeAgo date={message.created_at.toString()} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="p-4 flex-shrink-0 w-full bg-transparent">
        <form className="relative flex items-center w-full" onSubmit={onSubmit}>
          <input
            required
            onChange={onChange}
            value={message}
            className="w-full h-10 px-5 transition bg-transparent border-none rounded-full focus:outline-none ring-2 focus:ring-4 ring-neutral-200 focus:ring-neutral-50 placeholder:text-neutral-400"
            type="text"
            name="message"
            placeholder="메세지 쓰기"
          />
          <button
            aria-label="send_message"
            className="absolute right-0 top-1"
            disabled={isSubmitting}
          >
            <PaperAirplaneIcon
              className={`transition-colors size-8 ${
                isSubmitting
                  ? "text-neutral-400"
                  : "text-indigo-500 hover:text-indigo-300"
              }`}
            />
          </button>
        </form>
      </div>
      {error && (
        <div className="p-2 text-sm text-red-500 bg-red-100 rounded">
          {error}
        </div>
      )}
    </div>
  );
}
