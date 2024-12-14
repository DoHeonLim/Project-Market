/**
File Name : components/tab-bar
Description : 탭 바 컴포넌트
Author : 임도헌

History
Date        Author   Status    Description
2024.10.14  임도헌   Created
2024.10.14  임도헌   Modified  tab-bar 컴포넌트 추가
2024.10.17  임도헌   Modified  tab-bar 크기 max-w-screen-sm로 변경
2024.11.25  임도헌   Modified  tab-bar hover 스타일 추가
2024.12.15  임도헌   Modified  보드포트 컨셉으로 변경
2024.12.15  임도헌   Modified  다크모드/라이트모드 적용
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
    <>
      <div className="pt-20" />
      <div
        className="fixed bottom-0 w-full mx-auto max-w-screen-sm grid grid-cols-5 items-center border-t px-5 h-20 
        dark:bg-neutral-800 bg-white 
        dark:border-neutral-600 border-neutral-200
        transition-colors duration-200"
      >
        <Link
          href="/products"
          className="flex flex-col items-center gap-px p-2
            hover:bg-neutral-100 dark:hover:bg-neutral-700 
            rounded-xl transition-colors"
        >
          {pathname === "/products" ? (
            <SolidHomeIcon
              aria-label="activate_home_icon"
              className="size-7 dark:text-primary-light text-primary"
            />
          ) : (
            <OutlineHomeIcon
              aria-label="deactive_home_icon"
              className="size-7 dark:text-neutral-400 text-neutral-600"
            />
          )}
          <span
            className={`text-sm ${
              pathname === "/products"
                ? "dark:text-primary-light text-primary"
                : "dark:text-neutral-400 text-neutral-600"
            }`}
          >
            항구
          </span>
        </Link>
        <Link
          href="/life"
          className="flex flex-col items-center gap-px p-2
            hover:bg-neutral-100 dark:hover:bg-neutral-700 
            rounded-xl transition-colors"
        >
          {pathname === "/life" ? (
            <SolidNewspaperIcon
              aria-label="activate_life_icon"
              className="size-7 dark:text-primary-light text-primary"
            />
          ) : (
            <OutlineNewspaperIcon
              aria-label="deactive_life_icon"
              className="size-7 dark:text-neutral-400 text-neutral-600"
            />
          )}
          <span
            className={`text-sm ${
              pathname === "/life"
                ? "dark:text-primary-light text-primary"
                : "dark:text-neutral-400 text-neutral-600"
            }`}
          >
            항해일지
          </span>
        </Link>
        <Link
          href="/chat"
          className="flex flex-col items-center gap-px p-2
            hover:bg-neutral-100 dark:hover:bg-neutral-700 
            rounded-xl transition-colors"
        >
          {pathname === "/chat" ? (
            <SolidChatIcon
              aria-label="activate_chat_icon"
              className="size-7 dark:text-primary-light text-primary"
            />
          ) : (
            <OutlineChatIcon
              aria-label="deactive_chat_icon"
              className="size-7 dark:text-neutral-400 text-neutral-600"
            />
          )}
          <span
            className={`text-sm ${
              pathname === "/chat"
                ? "dark:text-primary-light text-primary"
                : "dark:text-neutral-400 text-neutral-600"
            }`}
          >
            신호
          </span>
        </Link>
        <Link
          href="/live"
          className="flex flex-col items-center gap-px p-2
            hover:bg-neutral-100 dark:hover:bg-neutral-700 
            rounded-xl transition-colors"
        >
          {pathname === "/live" ? (
            <SolidVideoCameraIcon
              aria-label="activate_live_icon"
              className="size-7 dark:text-primary-light text-primary"
            />
          ) : (
            <OutlineVideoCameraIcon
              aria-label="deactive_live_icon"
              className="size-7 dark:text-neutral-400 text-neutral-600"
            />
          )}
          <span
            className={`text-sm ${
              pathname === "/live"
                ? "dark:text-primary-light text-primary"
                : "dark:text-neutral-400 text-neutral-600"
            }`}
          >
            등대방송
          </span>
        </Link>
        <Link
          href="/profile"
          className="flex flex-col items-center gap-px p-2
            hover:bg-neutral-100 dark:hover:bg-neutral-700 
            rounded-xl transition-colors"
        >
          {pathname === "/profile" ? (
            <SolidUserIcon
              aria-label="activate_profile_icon"
              className="size-7 dark:text-primary-light text-primary"
            />
          ) : (
            <OutlineUserIcon
              aria-label="deactive_profile_icon"
              className="size-7 dark:text-neutral-400 text-neutral-600"
            />
          )}
          <span
            className={`text-sm ${
              pathname === "/profile"
                ? "dark:text-primary-light text-primary"
                : "dark:text-neutral-400 text-neutral-600"
            }`}
          >
            선원증
          </span>
        </Link>
      </div>
    </>
  );
}
