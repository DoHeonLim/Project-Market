/**
File Name : components/stream-list
Description : 스트리밍 리스트
Author : 임도헌

History
Date        Author   Status    Description
2024.11.19  임도헌   Created
2024.11.19  임도헌   Modified  스트리밍 리스트 컴포넌트 추가
2024.11.21  임도헌   Modified  현재 라이브 상태 isLived 추가
*/
"use client";

import { streamStatus } from "@/app/(tabs)/live/actions";
import { UserIcon } from "@heroicons/react/24/solid";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

interface IStreamList {
  id: number;
  user: {
    avatar: string | null;
    username: string;
  };
  title: string;
  stream_id: string;
}

export default function StreamList({
  id,
  user,
  title,
  stream_id,
}: IStreamList) {
  // 라이브 여부
  const [isLived, setIsLived] = useState("");
  useEffect(() => {
    const liveStateus = async () => {
      // 현재 방송 상태
      const status = await streamStatus(stream_id);
      // 현재 라이브 상태
      const currentState = status?.result?.status?.current?.state ?? ""; // current가 없을 경우 빈 값
      setIsLived(currentState);
    };
    liveStateus();
  }, [stream_id]);
  return (
    <Link
      href={`/streams/${id}`}
      className="flex w-full border-2 border-spacing-1 border-neutral-400 hover:ring-4 hover:ring-neutral-600 px-4 py-6 rounded-2xl transition-colors hover:border-neutral-500 *:text-white"
    >
      <div key={id} className="flex items-center justify-between w-full">
        <div className="flex items-center">
          <div className="mr-4 size-8">
            {user.avatar !== null ? (
              <Image
                width={40}
                height={40}
                src={user.avatar!}
                alt={user.username}
              />
            ) : (
              <UserIcon aria-label="user_icon" />
            )}
          </div>
          <span>{user.username}</span>
          <div className="ml-4 text-xl font-semibold">
            <span>{title}</span>
          </div>
        </div>
        <div className="flex items-center">
          {isLived === "connected" ? (
            <div className="flex items-center justify-center w-20 h-8 bg-indigo-500 rounded-md">
              <span className="text-sm font-semibold">방송 중</span>
            </div>
          ) : (
            <div className="flex items-center justify-center w-20 h-8 bg-red-500 rounded-md">
              <span className="text-sm font-semibold animate-pulse">
                방송 종료
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
