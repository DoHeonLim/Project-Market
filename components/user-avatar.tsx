/**
File Name : components/user-avatar
Description : 유저 아바타 컴포넌트
Author : 임도헌

History
Date        Author   Status    Description
2024.12.07  임도헌   Created
2024.12.07  임도헌   Modified  유저 아바타 컴포넌트 추가
2024.12.12  임도헌   Modified  유저 아바타 생성시간 표시 변경
*/

"use client";

import { UserIcon } from "@heroicons/react/24/solid";
import Image from "next/image";
import Link from "next/link";
import TimeAgo from "./time-ago";

interface UserAvatarProps {
  avatar: string | null;
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
      className={`flex items-center gap-2 *:text-white ${
        disabled ? "" : "hover:bg-neutral-400"
      } rounded-md pr-2`}
    >
      {avatar !== null ? (
        <Image
          width={size === "lg" ? 200 : 40}
          height={size === "lg" ? 200 : 40}
          className={`rounded-full ${sizes[size]} object-cover`}
          src={`${avatar}/public`}
          alt={username}
        />
      ) : (
        <UserIcon
          aria-label="user_icon"
          className={`${sizes[size]} ${
            size === "lg" ? "text-gray-300" : ""
          } rounded-${size === "lg" ? "full" : "md"}`}
        />
      )}
      <div className="flex items-start h-full">
        {showUsername ? (
          text ? (
            <div className="text-sm font-semibold">
              {username}
              {text}
            </div>
          ) : (
            <div className="text-sm font-semibold">{username}</div>
          )
        ) : null}
        <div className="text-xs">
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
