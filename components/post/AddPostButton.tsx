/**
 * File Name : components/post/AddPostButton
 * Description : 게시글 추가 버튼 (하단 고정)
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2025.06.26  임도헌   Created   게시글 추가 버튼 생성
 */

import Link from "next/link";
import { PlusIcon } from "@heroicons/react/24/solid";

export default function AddPostButton() {
  return (
    <Link
      href="/posts/add"
      className="fixed flex items-center justify-center text-white transition-all bg-primary dark:bg-primary-light hover:bg-primary/90 dark:hover:bg-primary-light/90 hover:scale-105 active:scale-95 rounded-full size-16 bottom-24 right-8 shadow-lg shadow-primary/30 dark:shadow-primary-light/30 z-10"
      title="새 게시글 생성"
      aria-label="게시글 작성"
    >
      <PlusIcon aria-label="add-post" className="size-10" />
    </Link>
  );
}
