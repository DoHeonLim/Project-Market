/**
 * File Name : app/not-found.tsx
 * Description : 전역 404 Not Found 페이지 (보드포트 컨셉)
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2026.01.09  임도헌   Created   항해 컨셉(항로 이탈) 커스텀 404 페이지 추가
 */

import Link from "next/link";
import { LifebuoyIcon } from "@heroicons/react/24/outline";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center">
      {/* 아이콘 영역 (둥둥 떠다니는 효과) */}
      <div className="relative mb-8 animate-float">
        {/* 뒤쪽 은은한 광원 효과 */}
        <div className="absolute inset-0 bg-blue-500/20 dark:bg-blue-400/10 blur-3xl rounded-full" />

        <LifebuoyIcon
          className="relative w-32 h-32 text-primary dark:text-primary-light"
          strokeWidth={1.5}
        />
      </div>

      {/* 텍스트 영역 */}
      <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white mb-3">
        항로를 이탈했습니다
      </h1>

      <p className="text-neutral-600 dark:text-neutral-400 mb-8 leading-relaxed max-w-sm mx-auto">
        요청하신 페이지가 지도에 존재하지 않습니다.
        <br />
        삭제되었거나 주소가 변경되었을 수 있어요.
      </p>

      {/* 액션 버튼 */}
      <Link
        href="/products"
        className="
          inline-flex items-center justify-center gap-2
          px-6 py-3 rounded-xl
          bg-primary hover:bg-primary-dark 
          dark:bg-primary dark:hover:bg-primary-light
          text-white dark:text-neutral-900
          font-semibold transition-all
          shadow-lg hover:shadow-xl hover:-translate-y-0.5
        "
      >
        <span>항구로 돌아가기</span>
      </Link>
    </div>
  );
}
