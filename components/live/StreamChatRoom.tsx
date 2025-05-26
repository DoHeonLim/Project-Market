/**
 File Name : components/live/StreamChatRoom
 Description : 스트리밍 채팅방 컴포넌트
 Author : 임도헌
 
 History
 Date        Author   Status    Description
 2024.11.21  임도헌   Created
 2024.11.21  임도헌   Modified  스트리밍 채팅방 컴포넌트
 2024.11.23  임도헌   Modified  스트리밍 채팅방 컴포넌트 스크롤 및 useRef로 최신 메시지 받을 시 스크롤바를 최하단으로 옮기는 코드 추가
 2024.12.08  임도헌   Modified  시간 표시 클라이언트로 변경
 2024.12.19  임도헌   Modified  supabase 클라이언트 코드 lib로 이동
 */
"use client";

import {
  InitialStreamChatMessages,
  saveStreamMessage,
} from "@/app/streams/[id]/actions";
import {
  PaperAirplaneIcon,
  UserIcon,
  VideoCameraIcon,
} from "@heroicons/react/24/solid";
import { supabase } from "@/lib/supabase";
import { RealtimeChannel } from "@supabase/supabase-js";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import TimeAgo from "../common/TimeAgo";

interface IStreamChatMessageListProps {
  initialStreamMessage: InitialStreamChatMessages;
  userId: number;
  streamChatRoomId: number;
  streamChatRoomhost: number;
  username: string;
  avatar: string;
}

export default function StreamChatRoom({
  initialStreamMessage,
  userId,
  streamChatRoomId,
  streamChatRoomhost,
  username,
  avatar,
}: IStreamChatMessageListProps) {
  const [messages, setMessages] = useState(initialStreamMessage);
  const [message, setMessage] = useState("");

  const channel = useRef<RealtimeChannel>();
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

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
        user: {
          username: username,
          avatar: avatar,
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
        user: {
          username,
          avatar,
        },
      },
    });
    await saveStreamMessage(message, streamChatRoomId);
    setMessage("");
  };
  useEffect(() => {
    const client = supabase;
    channel.current = client.channel(`room-${streamChatRoomId}`);
    channel.current
      .on("broadcast", { event: "message" }, (payload) => {
        setMessages((prevMsgs) => [...prevMsgs, payload.payload]);
      })
      .subscribe();
    //user가 페이지를 떠나면 channel의 구독을 해제한다.
    return () => {
      channel.current?.unsubscribe();
    };
  }, [streamChatRoomId]);
  return (
    <div className="flex flex-col w-full p-5 border-2 xl:w-1/4 xl:fixed top-12 right-12 border-neutral-600 rounded-xl">
      <div
        ref={chatContainerRef}
        className="flex flex-col overflow-auto scrollbar gap-5 px-5 pb-5 h-[300px] xl:h-[600px]"
      >
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-2 items-center ${
              message.userId === userId ? "justify-end" : ""
            }`}
          >
            {message.user.avatar !== null ? (
              message.userId === streamChatRoomhost ? (
                <div className="relative">
                  <VideoCameraIcon className="absolute size-5 text-yellow-400 top-1.5 -left-5" />
                  <Image
                    src={`${message.user.avatar!}/avatar`}
                    alt={message.user.username}
                    width={50}
                    height={50}
                    className="rounded-full size-8"
                  />
                </div>
              ) : (
                <Image
                  src={`${message.user.avatar!}/avatar`}
                  alt={message.user.username}
                  width={50}
                  height={50}
                  className="rounded-full size-8"
                />
              )
            ) : message.userId === streamChatRoomhost ? (
              <div className="relative size-8">
                <VideoCameraIcon
                  aria-label="host-icon"
                  className="absolute size-5 text-yellow-400 top-1.5 -left-5"
                />
                <UserIcon aria-label="user_icon" />
              </div>
            ) : (
              <div className="size-8">
                <UserIcon aria-label="user_icon" />
              </div>
            )}
            <span className="flex justify-center items-center">
              {message.user.username}
            </span>
            <div
              className={`flex flex-col gap-1 ${
                message.userId === userId ? "items-end" : ""
              }`}
            >
              <span
                className={`${
                  message.userId === userId ? "bg-indigo-500" : "bg-neutral-500"
                } px-2.5 rounded-md`}
              >
                {message.payload}
              </span>
            </div>
            <TimeAgo date={message.created_at.toString()} />
          </div>
        ))}
      </div>
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
        <button className="absolute right-0 top-1">
          <PaperAirplaneIcon
            aria-label="send_message"
            className="text-indigo-500 transition-colors size-8 hover:text-indigo-300"
          />
        </button>
      </form>
    </div>
  );
}
