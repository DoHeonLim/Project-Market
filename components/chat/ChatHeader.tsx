/**
 * File Name : components/chat/ChatHeader
 * Description : 채팅 상단 헤더 (유저 + 제품 정보 + BackButton)
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2025.07.14  임도헌   Created   ChatMessagesList에서 분리
 * 2025.07.15  임도헌   Modified  UI 변경
 * 2025.11.13  임도헌   Modified  BackButton 도입, 앱바/접근성/다크모드 정합
 */
"use client";

import Image from "next/image";
import Link from "next/link";
import UserAvatar from "../common/UserAvatar";
import BackButton from "@/components/common/BackButton";
import { formatToWon } from "@/lib/utils";
import type { ChatUser } from "@/types/chat";

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
  const img = product.images?.[0]?.url ?? "";
  const isReserved = !!product.reservation_userId && !product.purchase_userId;
  const isSold = !!product.purchase_userId;

  return (
    <header
      className="
        sticky top-0 z-40
        bg-white/80 dark:bg-neutral-900/80
        backdrop-blur supports-[backdrop-filter]:bg-white/60
        border-b border-neutral-200/70 dark:border-neutral-800
      "
    >
      <div className="mx-auto w-full max-w-screen-sm px-3">
        <div className="h-12 sm:h-[52px] flex items-center gap-2">
          {/* 공통 뒤로가기 */}
          <BackButton fallbackHref="/chat" variant="appbar" />

          {/* 상대 유저 */}
          <div className="min-w-0">
            <UserAvatar
              avatar={user.avatar}
              username={user.username}
              showUsername
            />
          </div>

          {/* 우측 상품 미니 카드(상세로 이동) */}
          <Link
            href={`/products/view/${product.id}`}
            className="ml-auto mr-4 flex items-center gap-2 min-w-0 group"
            prefetch={false}
            aria-label={`${product.title} 상세로 이동`}
          >
            <div className="relative size-10 sm:size-12 rounded-lg overflow-hidden border border-neutral-200/60 dark:border-neutral-700 flex-shrink-0">
              {img ? (
                <Image
                  src={`${img}/avatar`}
                  alt={product.title}
                  sizes="48px"
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-neutral-200 dark:bg-neutral-800" />
              )}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="truncate text-[13px] sm:text-[14px] font-medium text-neutral-900 dark:text-neutral-100">
                {product.title}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-primary dark:text-primary-light">
                  💰 {formatToWon(product.price)}원
                </span>
                {isReserved && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                    예약중
                  </span>
                )}
                {isSold && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-200 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-200">
                    판매완료
                  </span>
                )}
              </div>
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
}
