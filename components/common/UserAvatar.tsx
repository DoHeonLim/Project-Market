/**
 * File Name : components/common/UserAvatar
 * Description : 유저 아바타 컴포넌트
 * Author : 임도헌
 *
 * History
 * 2024.12.07  임도헌   Created
 * 2024.12.07  임도헌   Modified  유저 아바타 컴포넌트 추가
 * 2024.12.16  임도헌   Modified  다크모드 적용
 * 2025.11.12  임도헌   Modified  className 지원 및 아바타 표시 조건/접근성 보강
 * 2025.11.16  임도헌   Modified  compact 옵션 + inline-flex/shrink-0, 빈 텍스트 래퍼 제거
 * 2025.12.12  임도헌   Modified  created_at 없을 때 빈 여백 제거, CSS size와 이미지 px 정합
 */

"use client";

import { UserIcon } from "@heroicons/react/24/solid";
import Image from "next/image";
import Link from "next/link";
import TimeAgo from "./TimeAgo";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  avatar?: string | null;
  username: string;
  showUsername?: boolean;
  size?: "sm" | "md" | "lg";
  created_at?: Date;
  disabled?: boolean;
  text?: string;
  className?: string;
  /** 채팅/리스트 등 초소형 배치용: 바깥 패딩 제거, 호버 제거 */
  compact?: boolean;
}

export default function UserAvatar({
  avatar,
  username,
  showUsername = true,
  size = "sm",
  created_at,
  disabled = false,
  text,
  className,
  compact = false,
}: UserAvatarProps) {
  // CSS box size와 실제 이미지 요청 px를 맞춰서 흐림 방지
  const sizes = {
    sm: { box: "size-8", px: 32 }, // 32px
    md: { box: "size-28", px: 112 }, // 112px
    lg: { box: "size-52", px: 208 }, // 208px
  } as const;

  const root = (
    <div
      className={cn(
        "inline-flex shrink-0 items-center rounded-md",
        compact ? "p-0" : "p-2",
        disabled
          ? ""
          : compact
            ? ""
            : "hover:bg-neutral-100 dark:hover:bg-neutral-800",
        className
      )}
    >
      {avatar ? (
        <Image
          width={sizes[size].px}
          height={sizes[size].px}
          className={cn(
            "rounded-full object-cover bg-white dark:bg-neutral-900",
            sizes[size].box,
            "ring-1 ring-black/5 dark:ring-white/10"
          )}
          src={`${avatar}/public`}
          alt={`${username}의 프로필 이미지`}
        />
      ) : (
        <UserIcon
          aria-hidden
          className={cn(
            sizes[size].box,
            size === "lg"
              ? "text-gray-300 dark:text-gray-500"
              : "text-neutral-300 dark:text-neutral-500",
            size === "lg" ? "rounded-full" : "rounded-md"
          )}
        />
      )}

      {(showUsername || text || created_at) && (
        <div className={cn("flex items-start h-full min-w-0", "pl-2")}>
          {showUsername && (
            <div className="text-sm font-semibold dark:text-white truncate">
              {username}
              {text ?? ""}
            </div>
          )}

          {/* created_at이 없으면 이 블록 자체를 렌더하지 않아 '빈 간격'이 생기지 않음 */}
          {created_at && (
            <div className="ml-2 text-xs text-gray-600 dark:text-gray-400">
              <TimeAgo date={created_at.toString()} />
            </div>
          )}
        </div>
      )}
    </div>
  );

  if (disabled) return root;

  return (
    <Link
      href={`/profile/${username}`}
      aria-label={`${username} 프로필로 이동`}
    >
      {root}
    </Link>
  );
}
