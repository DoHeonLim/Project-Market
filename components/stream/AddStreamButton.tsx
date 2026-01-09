/**
 * File Name : components/stream/AddStreamButton
 * Description : 스트리밍 추가(생성) 플로팅 버튼 (우측 하단 고정)
 * Author : 임도헌
 *
 * History
 * Date        Author   Status     Description
 * 2025.08.25  임도헌   Created    최초 생성
 * 2025.09.09  임도헌   Modified   Tailwind 클래스 보완(누락/오타 수정), a11y/포커스 링/호버 스케일 추가, 아이콘 사용 통일(Heroicons)
 */

import Link from "next/link";
import { PlusIcon } from "@heroicons/react/24/solid";

export default function AddStreamButton() {
  return (
    <Link
      href="/streams/add"
      aria-label="새 스트리밍 생성"
      title="새 스트리밍 생성"
      className="fixed flex items-center justify-center text-white transition-all bg-primary dark:bg-primary-light hover:bg-primary/90 dark:hover:bg-primary-light/90 hover:scale-105 active:scale-95 rounded-full size-16 bottom-24 right-8 shadow-lg shadow-primary/30 dark:shadow-primary-light/30 z-10"
    >
      <PlusIcon aria-hidden="true" className="size-8" />
    </Link>
  );
}
