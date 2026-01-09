/**
 * File Name : components/stream/streamDetail/StreamEndedOverlay
 * Description : 방송 종료 시 iframe 위에 표시되는 오버레이 UI
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2025.07.31  임도헌   Created   컴포넌트 분리
 * 2025.09.09  임도헌   Modified  a11y(role=status/aria-live) 및 링크 자동 포커스, username 가드/인코딩
 */

"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";

interface StreamEndedOverlayProps {
  username: string;
}

export default function StreamEndedOverlay({
  username,
}: StreamEndedOverlayProps) {
  const linkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    // 오버레이가 나타나면 링크로 포커스 이동 (키보드 사용자 배려)
    const t = setTimeout(() => linkRef.current?.focus(), 0);
    return () => clearTimeout(t);
  }, []);

  const safeHref = username
    ? `/profile/${encodeURIComponent(username)}/channel`
    : "/streams";

  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-white backdrop-blur-sm"
      role="status"
      aria-live="polite"
      aria-label="방송 종료 안내"
    >
      <p className="mb-4 text-xl font-semibold">방송이 종료되었습니다</p>
      <Link
        ref={linkRef}
        href={safeHref}
        className="rounded-md bg-indigo-500 px-4 py-2 transition-colors hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        aria-label="다시보기 목록으로 이동"
      >
        다시보기 목록으로 이동
      </Link>
    </div>
  );
}
