/**
 * File Name : components/common/TabBar
 * Description : 탭 바 컴포넌트
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2024.10.14  임도헌   Created
 * 2024.10.14  임도헌   Modified  tab-bar 컴포넌트 추가
 * 2024.10.17  임도헌   Modified  tab-bar 크기 max-w-screen-sm로 변경
 * 2024.11.25  임도헌   Modified  tab-bar hover 스타일 추가
 * 2024.12.15  임도헌   Modified  보드포트 컨셉으로 변경
 * 2024.12.15  임도헌   Modified  다크모드/라이트모드 적용
 * 2025.04.29  임도헌   Modified  반응형 디자인 적용
 * 2025.12.12  임도헌   Modified  sm에서 max-w 고정 유지(2중 래퍼), streams 텍스트 활성 버그 수정, Spacer 제거 전제 정리
 */
"use client";

import {
  NewspaperIcon as SolidNewspaperIcon,
  HomeIcon as SolidHomeIcon,
  ChatBubbleOvalLeftEllipsisIcon as SolidChatIcon,
  VideoCameraIcon as SolidVideoCameraIcon,
  UserIcon as SolidUserIcon,
} from "@heroicons/react/24/solid";
import {
  NewspaperIcon as OutlineNewspaperIcon,
  HomeIcon as OutlineHomeIcon,
  ChatBubbleOvalLeftEllipsisIcon as OutlineChatIcon,
  VideoCameraIcon as OutlineVideoCameraIcon,
  UserIcon as OutlineUserIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function TabBar() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="하단 탭 바"
      className="
        fixed bottom-0 left-0 right-0 z-50 border-t
        dark:border-neutral-600 border-neutral-200
        dark:bg-neutral-800 bg-white transition-colors duration-200
        sm:left-1/2 sm:right-auto sm:-translate-x-1/2 sm:w-full sm:max-w-screen-sm
        sm:shadow-xl sm:rounded-t-2xl overflow-hidden
      "
    >
      <div className="grid grid-cols-5 items-center px-2 sm:px-5 h-16 sm:h-20">
        <Link
          href="/products"
          aria-current={pathname === "/products" ? "page" : undefined}
          className="flex flex-col items-center justify-center gap-0.5 p-1 sm:p-2
              hover:bg-neutral-100 dark:hover:bg-neutral-700
              rounded-xl transition-colors"
        >
          {pathname === "/products" ? (
            <SolidHomeIcon
              aria-hidden="true"
              className="size-6 sm:size-7 dark:text-primary-light text-primary"
            />
          ) : (
            <OutlineHomeIcon
              aria-hidden="true"
              className="size-6 sm:size-7 dark:text-neutral-400 text-neutral-600"
            />
          )}
          <span
            className={`text-xs sm:text-sm whitespace-nowrap ${
              pathname === "/products"
                ? "dark:text-primary-light text-primary"
                : "dark:text-neutral-400 text-neutral-600"
            }`}
          >
            항구
          </span>
        </Link>

        <Link
          href="/posts"
          aria-current={pathname === "/posts" ? "page" : undefined}
          className="flex flex-col items-center justify-center gap-0.5 p-1 sm:p-2
              hover:bg-neutral-100 dark:hover:bg-neutral-700
              rounded-xl transition-colors"
        >
          {pathname === "/posts" ? (
            <SolidNewspaperIcon
              aria-hidden="true"
              className="size-6 sm:size-7 dark:text-primary-light text-primary"
            />
          ) : (
            <OutlineNewspaperIcon
              aria-hidden="true"
              className="size-6 sm:size-7 dark:text-neutral-400 text-neutral-600"
            />
          )}
          <span
            className={`text-xs sm:text-sm whitespace-nowrap ${
              pathname === "/posts"
                ? "dark:text-primary-light text-primary"
                : "dark:text-neutral-400 text-neutral-600"
            }`}
          >
            항해일지
          </span>
        </Link>

        <Link
          href="/chat"
          aria-current={pathname === "/chat" ? "page" : undefined}
          className="flex flex-col items-center justify-center gap-0.5 p-1 sm:p-2
              hover:bg-neutral-100 dark:hover:bg-neutral-700
              rounded-xl transition-colors"
        >
          {pathname === "/chat" ? (
            <SolidChatIcon
              aria-hidden="true"
              className="size-6 sm:size-7 dark:text-primary-light text-primary"
            />
          ) : (
            <OutlineChatIcon
              aria-hidden="true"
              className="size-6 sm:size-7 dark:text-neutral-400 text-neutral-600"
            />
          )}
          <span
            className={`text-xs sm:text-sm whitespace-nowrap ${
              pathname === "/chat"
                ? "dark:text-primary-light text-primary"
                : "dark:text-neutral-400 text-neutral-600"
            }`}
          >
            신호
          </span>
        </Link>

        <Link
          href="/streams"
          aria-current={pathname === "/streams" ? "page" : undefined}
          className="flex flex-col items-center justify-center gap-0.5 p-1 sm:p-2
              hover:bg-neutral-100 dark:hover:bg-neutral-700
              rounded-xl transition-colors"
        >
          {pathname === "/streams" ? (
            <SolidVideoCameraIcon
              aria-hidden="true"
              className="size-6 sm:size-7 dark:text-primary-light text-primary"
            />
          ) : (
            <OutlineVideoCameraIcon
              aria-hidden="true"
              className="size-6 sm:size-7 dark:text-neutral-400 text-neutral-600"
            />
          )}
          <span
            className={`text-xs sm:text-sm whitespace-nowrap ${
              pathname === "/streams"
                ? "dark:text-primary-light text-primary"
                : "dark:text-neutral-400 text-neutral-600"
            }`}
          >
            등대방송
          </span>
        </Link>

        <Link
          href="/profile"
          aria-current={pathname === "/profile" ? "page" : undefined}
          className="flex flex-col items-center justify-center gap-0.5 p-1 sm:p-2
              hover:bg-neutral-100 dark:hover:bg-neutral-700
              rounded-xl transition-colors"
        >
          {pathname === "/profile" ? (
            <SolidUserIcon
              aria-hidden="true"
              className="size-6 sm:size-7 dark:text-primary-light text-primary"
            />
          ) : (
            <OutlineUserIcon
              aria-hidden="true"
              className="size-6 sm:size-7 dark:text-neutral-400 text-neutral-600"
            />
          )}
          <span
            className={`text-xs sm:text-sm whitespace-nowrap ${
              pathname === "/profile"
                ? "dark:text-primary-light text-primary"
                : "dark:text-neutral-400 text-neutral-600"
            }`}
          >
            선원증
          </span>
        </Link>
      </div>
    </nav>
  );
}
