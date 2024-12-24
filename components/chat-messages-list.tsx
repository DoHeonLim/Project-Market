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
 */
"use client";

import {
  InitialChatMessages,
  saveMessage,
  readMessageUpdate,
} from "@/app/chats/[id]/actions";
import { PaperAirplaneIcon } from "@heroicons/react/24/solid";
import { supabase } from "@/lib/supabase";
import { RealtimeChannel } from "@supabase/supabase-js";
import { useEffect, useRef, useState, useCallback } from "react";
import UserAvatar from "./user-avatar";
import TimeAgo from "./time-ago";
import Image from "next/image";

interface IChatMessageListProps {
  initialMessages: InitialChatMessages;
  userId: number;
  productChatRoomId: string;
  username: string;
  avatar: string;
  product: {
    title: string;
    images: { url: string }[];
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

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const {
      target: { value },
    } = event;
    setMessage(value);
  };
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

    setMessages((prevMsgs) => [...prevMsgs, newMessage]);
    setMessage("");

    try {
      channel.current?.send({
        type: "broadcast",
        event: "message",
        payload: {
          ...newMessage,
          productChatRoomId,
        },
      });

      await saveMessage(message, productChatRoomId);
    } catch (error) {
      setMessages((prevMsgs) =>
        prevMsgs.filter((msg) => msg.id !== newMessage.id)
      );
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
  }, [productChatRoomId, userId]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [scrollToBottom]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  return (
    <div className="flex flex-col h-[95vh]">
      <div className="relative p-4 border-b dark:border-neutral-800">
        <div className="flex items-center gap-3">
          <div className="relative size-10">
            <Image
              src={`${product.images[0]?.url}/avatar`}
              alt={product.title}
              fill
              className="object-cover rounded-md"
            />
          </div>
          <h2 className="font-medium">{product.title}</h2>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-5 space-y-5 scrollbar">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-2 items-start ${
              message.userId === userId ? "justify-end" : ""
            }`}
          >
            {message.userId === userId ? null : (
              <UserAvatar
                avatar={message.user.avatar}
                username={message.user.username}
                size="md"
              />
            )}
            <div
              className={`flex flex-col gap-1 ${
                message.userId === userId ? "items-end" : ""
              }`}
            >
              <span
                className={`${
                  message.userId === userId ? "bg-indigo-500" : "bg-neutral-500"
                } p-2.5 rounded-md`}
              >
                {message.payload}
              </span>
              <div
                className={`flex ${
                  message.userId === userId
                    ? "items-center justify-end gap-2 "
                    : ""
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
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4">
        <form className="relative flex items-center" onSubmit={onSubmit}>
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
