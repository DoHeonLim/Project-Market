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
 */
"use client";

import { InitialChatMessages, saveMessage } from "@/app/chats/[id]/actions";
import { formatToTimeAgo } from "@/lib/utils";
import { PaperAirplaneIcon, UserIcon } from "@heroicons/react/24/solid";
import { createClient, RealtimeChannel } from "@supabase/supabase-js";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

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
  const channel = useRef<RealtimeChannel>();
  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const {
      target: { value },
    } = event;
    setMessage(value);
  };
  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    // 메시지 전송 시 유저에게 메시지를 보낸 것 처럼 처리
    setMessages((prevMsgs) => [
      ...prevMsgs,
      {
        id: Date.now(),
        payload: message,
        created_at: new Date(),
        userId,
        isRead: false,
        user: {
          username: "string",
          avatar: "",
        },
      },
    ]);
    channel.current?.send({
      type: "broadcast",
      event: "message",
      payload: {
        id: Date.now(),
        payload: message,
        created_at: new Date(),
        userId,
        isRead: false,
        user: {
          username,
          avatar,
        },
      },
    });
    await saveMessage(message, productChatRoomId);
    setMessage("");
  };
  useEffect(() => {
    const client = createClient(SUPABASE_URL!, SUPABASE_PUBLIC_KEY!);
    channel.current = client.channel(`room-${productChatRoomId}`);
    channel.current
      .on("broadcast", { event: "message" }, (payload) => {
        setMessages((prevMsgs) => [...prevMsgs, payload.payload]);
      })
      .subscribe();
    //user가 페이지를 떠나면 channel의 구독을 해제한다.
    return () => {
      channel.current?.unsubscribe();
    };
  }, [productChatRoomId]);
  return (
    <div className="flex flex-col justify-end min-h-screen gap-5 p-5">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex gap-2 items-start ${
            message.userId === userId ? "justify-end" : ""
          }`}
        >
          {message.userId === userId ? null : message.user.avatar !== null ? (
            <Image
              src={message.user.avatar!}
              alt={message.user.username}
              width={50}
              height={50}
              className="rounded-full size-8"
            />
          ) : (
            <div className="size-8">
              <UserIcon aria-label="user_icon" />
            </div>
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
              <span className="text-xs">
                {formatToTimeAgo(message.created_at.toString())}
              </span>
            </div>
          </div>
        </div>
      ))}
      <form className="relative flex items-center" onSubmit={onSubmit}>
        <input
          required
          onChange={onChange}
          value={message}
          className="w-full h-10 px-5 mb-2 transition bg-transparent border-none rounded-full focus:outline-none ring-2 focus:ring-4 ring-neutral-200 focus:ring-neutral-50 placeholder:text-neutral-400"
          type="text"
          name="message"
          placeholder="메세지 쓰기"
        />
        <button aria-label="send_message" className="absolute right-0 top-1">
          <PaperAirplaneIcon className="text-indigo-500 transition-colors size-8 hover:text-indigo-300" />
        </button>
      </form>
    </div>
  );
}
