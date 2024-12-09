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
 */
"use client";

import { InitialChatMessages, saveMessage } from "@/app/chats/[id]/actions";
import { PaperAirplaneIcon } from "@heroicons/react/24/solid";
import { createClient, RealtimeChannel } from "@supabase/supabase-js";
import { useEffect, useRef, useState } from "react";
import UserAvatar from "./user-avatar";
import TimeAgo from "./time-ago";

const SUPABASE_PUBLIC_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLIC_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;

interface IChatMessageListProps {
  initialMessages: InitialChatMessages;
  userId: number;
  productChatRoomId: string;
  username: string;
  avatar: string;
}

export default function ChatMessagesList({
  initialMessages,
  userId,
  productChatRoomId,
  username,
  avatar,
}: IChatMessageListProps) {
  const [messages, setMessages] = useState(initialMessages);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
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
      await saveMessage(message, productChatRoomId);

      setMessages((prevMsgs) => [...prevMsgs, newMessage]);

      channel.current?.send({
        type: "broadcast",
        event: "message",
        payload: newMessage,
      });

      setMessage("");
    } catch (error) {
      console.error("메시지 전송 실패:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  useEffect(() => {
    const client = createClient(SUPABASE_URL!, SUPABASE_PUBLIC_KEY!);
    channel.current = client.channel(`room-${productChatRoomId}`);
    channel.current
      .on("broadcast", { event: "message" }, (payload) => {
        setMessages((prevMsgs) => {
          const isDuplicate = prevMsgs.some(
            (msg) => msg.id === payload.payload.id
          );
          if (isDuplicate) return prevMsgs;
          return [...prevMsgs, payload.payload];
        });
      })
      .subscribe();
    //user가 페이지를 떠나면 channel의 구독을 해제한다.
    return () => {
      channel.current?.unsubscribe();
    };
  }, [productChatRoomId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex flex-col h-[100vh]">
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
      <div className="p-4 border-t">
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
    </div>
  );
}
