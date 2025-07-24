/**
 * File Name : components/chat/ChatHeader
 * Description : 채팅 상단 헤더 (유저 + 제품 정보 표시)
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2025.07.14  임도헌   Created   ChatMessagesList에서 분리
 * 2025.07.15  임도헌   Modified  UI 변경
 */
"use client";

import { ChevronLeftIcon } from "@heroicons/react/24/solid";
import UserAvatar from "../common/UserAvatar";
import Image from "next/image";
import Link from "next/link";
import { formatToWon } from "@/lib/utils";
import { ChatUser } from "@/types/chat";

interface ChatHeaderProps {
  user: ChatUser;
  product: {
    id: number;
    title: string;
    images: { url: string }[];
    price: number;
    purchase_userId: number | null;
    reservation_userId: number | null;
  };
}

export default function ChatHeader({ user, product }: ChatHeaderProps) {
  return (
    <div
      className="fixed left-1/2 -translate-x-1/2 w-full max-w-screen-sm px-4 z-50 
        bg-white/50 dark:bg-white/10
        backdrop-blur-md
        border border-white/20 dark:border-white/10
        shadow-lg shadow-black/10"
    >
      <div className="flex items-center gap-3 px-3 py-2">
        <button
          onClick={() => window.history.back()}
          aria-label="뒤로가기"
          className="text-neutral-500 hover:text-white dark:text-indigo-500 dark:hover:text-indigo-800 text-semibold flex-shrink-0"
        >
          <ChevronLeftIcon className="size-8" />
        </button>

        <UserAvatar
          avatar={user.avatar}
          username={user.username}
          size="md"
          showUsername
          disabled
        />

        <Link
          href={`/products/view/${product.id}`}
          className="flex items-center gap-2"
        >
          <div className="relative size-12 rounded-lg overflow-hidden border border-neutral-200/20 dark:border-primary-dark/30">
            <Image
              src={`${product.images[0]?.url}/avatar`}
              alt={product.title}
              sizes="(max-width: 768px) 48px, 64px"
              priority
              fill
              className="object-cover"
            />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-medium text-primary dark:text-secondary-light truncate">
              {product.title}
            </span>
            <span className="text-xs font-semibold text-accent-dark dark:text-accent truncate">
              💰 {formatToWon(product.price)}원
            </span>
          </div>
        </Link>
      </div>
    </div>
  );
}
