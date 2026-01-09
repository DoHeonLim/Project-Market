/**
 * File Name : components/common/NotFound
 * Description : 공통 Not Found 컴포넌트
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2025.06.08  임도헌   Created   Not Found 공통 컴포넌트 생성
 */

import Link from "next/link";
import { XCircleIcon } from "@heroicons/react/24/solid";

interface NotFoundProps {
  title?: string;
  description?: string;
  redirectText?: string;
  redirectHref?: string;
}

export default function NotFound({
  title = "페이지를 찾을 수 없습니다",
  description = "요청하신 페이지가 삭제되었거나 존재하지 않습니다.",
  redirectText = "홈으로 돌아가기",
  redirectHref = "/",
}: NotFoundProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 space-y-6">
      <XCircleIcon className="h-12 w-12 text-red-500" />
      <h1 className="text-xl font-bold text-neutral-800 dark:text-white">
        {title}
      </h1>
      <p className="text-sm text-neutral-600 dark:text-neutral-400">
        {description}
      </p>
      <Link
        href={redirectHref}
        className="inline-block px-4 py-2 mt-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-md transition-colors"
      >
        {redirectText}
      </Link>
    </div>
  );
}
