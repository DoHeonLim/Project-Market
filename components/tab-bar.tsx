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
      <div className="fixed bottom-0 w-full mx-auto max-w-screen-sm grid grid-cols-5 items-center border-neutral-600 border-t px-5 h-20 *:text-white bg-neutral-800 *:transition-colors">
        <Link
          href="/products"
          className="flex flex-col items-center gap-px hover:bg-neutral-400 rounded-xl "
        >
          {pathname === "/products" ? (
            <SolidHomeIcon aria-label="activate_home_icon" className="size-7" />
          ) : (
            <OutlineHomeIcon
              aria-label="deactive_home_icon"
              className="size-7"
            />
          )}
          <span>홈</span>
        </Link>
        <Link
          href="/life"
          className="flex flex-col items-center gap-px hover:bg-neutral-400 rounded-xl"
        >
          {pathname === "/life" ? (
            <SolidNewspaperIcon
              aria-label="activate_life_icon"
              className="size-7"
            />
          ) : (
            <OutlineNewspaperIcon
              aria-label="deactive_life_icon"
              className="size-7"
            />
          )}
          <span>동네생활</span>
        </Link>
        <Link
          href="/chat"
          className="flex flex-col items-center gap-px hover:bg-neutral-400 rounded-xl"
        >
          {pathname === "/chat" ? (
            <SolidChatIcon aria-label="activate_chat_icon" className="size-7" />
          ) : (
            <OutlineChatIcon
              aria-label="deactive_chat_icon"
              className="size-7"
            />
          )}
          <span>채팅</span>
        </Link>
        <Link
          href="/live"
          className="flex flex-col items-center gap-px hover:bg-neutral-400 rounded-xl"
        >
          {pathname === "/live" ? (
            <SolidVideoCameraIcon
              aria-label="activate_live_icon"
              className="size-7"
            />
          ) : (
            <OutlineVideoCameraIcon
              aria-label="deactive_live_icon"
              className="size-7"
            />
          )}
          <span>쇼핑</span>
        </Link>
        <Link
          href="/profile"
          className="flex flex-col items-center gap-px hover:bg-neutral-400 rounded-xl"
        >
          {pathname === "/profile" ? (
            <SolidUserIcon
              aria-label="activate_profile_icon"
              className="size-7"
            />
          ) : (
            <OutlineUserIcon
              aria-label="deactive_profile_icon"
              className="size-7"
            />
          )}
          <span>내 정보</span>
        </Link>
      </div>
    </>
  );
}
