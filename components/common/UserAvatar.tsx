/**
File Name : components/common/UserAvatar
Description : 유저 아바타 컴포넌트
Author : 임도헌

History
Date        Author   Status    Description
2024.12.07  임도헌   Created
2024.12.07  임도헌   Modified  유저 아바타 컴포넌트 추가
2024.12.12  임도헌   Modified  유저 아바타 생성시간 표시 변경
2024.12.16  임도헌   Modified  다크모드 적용
*/

"use client";

import { UserIcon } from "@heroicons/react/24/solid";
import Image from "next/image";
import Link from "next/link";
import TimeAgo from "./TimeAgo";

interface UserAvatarProps {
  avatar?: string | null;
  username: string;
  showUsername?: boolean;
  size?: "sm" | "md" | "lg";
  created_at?: Date;
  disabled?: boolean;
  text?: string;
}

export default function UserAvatar({
  avatar,
  username,
  showUsername = true,
  size = "sm",
  created_at,
  disabled = false,
  text,
}: UserAvatarProps) {
  const sizes = {
    sm: "size-7",
    md: "size-10",
    lg: "size-52",
  };

  const AvatarContent = () => (
    <div
      className={`flex items-center p-2 ${
        disabled ? "" : "hover:bg-neutral-400 dark:hover:bg-neutral-700"
      } rounded-md`}
    >
      {avatar !== null ? (
        <Image
          width={size === "lg" ? 200 : 40}
          height={size === "lg" ? 200 : 40}
          className={`rounded-full ${sizes[size]} object-cover bg-white`}
          src={`${avatar}/public`}
          alt={username}
        />
      ) : (
        <UserIcon
          aria-label="user_icon"
          className={`${sizes[size]} ${
            size === "lg"
              ? "text-gray-300 dark:text-gray-500"
              : "text-neutral-200 dark:text-neutral-500"
          } rounded-${size === "lg" ? "full" : "md"}`}
        />
      )}
      <div className="flex items-start h-full pl-2">
        {showUsername ? (
          text ? (
            <div className="text-sm font-semibold dark:text-white">
              {username}
              {text}
            </div>
          ) : (
            <div className="text-sm font-semibold dark:text-white">
              {username}
            </div>
          )
        ) : null}
        <div className="text-xs text-gray-600 dark:text-gray-400">
          {created_at && <TimeAgo date={created_at?.toString() ?? null} />}
        </div>
      </div>
    </div>
  );

  if (disabled) {
    return <AvatarContent />;
  }

  return (
    <Link href={`/profile/${username}`}>
      <AvatarContent />
    </Link>
  );
}
