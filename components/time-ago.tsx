/**
 File Name : components/time-ago
 Description : 시간 표시 컴포넌트
 Author : 임도헌
 
 History
 Date        Author   Status    Description
 2024.12.08  임도헌   Created
 2024.12.08  임도헌   Modified  시간 표시 컴포넌트 추가
 2024.12.11  임도헌   Modified  마우스 올릴 시 정확한 시간 표시
 2024.12.26  임도헌   Modified  다크모드 추가
 */

// 시간을 바꾸는 과정에서 서버와 클라이언트의 시간이 다를 수 있기 때문에 클라이언트로 변경
/*TimeAgo 컴포넌트가 처음에는 아무것도 렌더링하지 않다가
클라이언트 사이드에서 마운트된 후에만 시간을 표시하므로
하이드레이션 에러가 발생하지 않을 것*/

"use client";

import { formatToTimeAgo } from "@/lib/utils";
import { useEffect, useState } from "react";

interface TimeAgoProps {
  date: string;
}

export default function TimeAgo({ date }: TimeAgoProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  // 날짜를 한국 시간대로 포맷
  const fullDate = new Date(date).toLocaleString("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <span
      className="text-xs text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
      title={fullDate}
    >
      {formatToTimeAgo(date)}
    </span>
  );
}
