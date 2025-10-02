/**
 * File Name : components/common/TimeAgo
 * Description : 시간 표시 컴포넌트
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2024.12.08  임도헌   Created
 * 2024.12.11  임도헌   Modified  마우스 올릴 시 정확한 시간 표시
 * 2024.12.26  임도헌   Modified  다크모드 추가
 * 2025.07.24  임도헌   Modified  스타일 변경
 * 2025.09.10  임도헌   Modified  자동 갱신(60s), 입력 타입 유연화, 시맨틱 <time>, 안전 가드, 불필요한 의존성 제거
 */

"use client";

import { formatToTimeAgo } from "@/lib/utils";
import { useEffect, useMemo, useState } from "react";

type TimeInput = string | number | Date;

interface TimeAgoProps {
  date: TimeInput; // Date | timestamp(ms) | 파싱 가능한 문자열(권장: ISO)
  refreshMs?: number; // 기본 60초
  className?: string;
  tooltipTimeZone?: string; // 기본 "Asia/Seoul"
}

/** 안전한 Date 변환 */
function toValidDate(input: TimeInput): Date | null {
  const date = input instanceof Date ? input : new Date(input);
  return Number.isNaN(date.getTime()) ? null : date;
}

export default function TimeAgo({
  date,
  refreshMs = 60_000, // numeric separator(60_000 === 60000)
  className = "",
  tooltipTimeZone = "Asia/Seoul",
}: TimeAgoProps) {
  const [mounted, setMounted] = useState(false);
  const [, setTick] = useState(0); // 주기적 재렌더 트리거(값 사용 안 함)

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const id = setInterval(() => setTick((t) => t + 1), refreshMs);
    return () => clearInterval(id);
  }, [mounted, refreshMs]);

  // 모든 훅은 조건문/조기 return 전에 호출
  const parsedDate = useMemo(() => toValidDate(date), [date]);

  // 초기 마운트 전에는 아무것도 렌더하지 않아 하이드레이션 경고 회피
  if (!mounted) return null;

  if (!parsedDate) {
    return (
      <time
        className={`text-xs text-neutral-700 dark:text-neutral-300 ${className}`}
        title="잘못된 날짜 형식"
      >
        -
      </time>
    );
  }

  // 툴팁(절대시간) 표기
  let tooltip = "";
  try {
    tooltip = parsedDate.toLocaleString("ko-KR", {
      timeZone: tooltipTimeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    tooltip = parsedDate.toISOString();
  }

  // 상대시간은 매 렌더에서 재계산되어 tick에 따라 갱신됨 (useMemo 불필요)
  const relative = formatToTimeAgo(parsedDate.toISOString());

  return (
    <time
      dateTime={parsedDate.toISOString()}
      className={`text-xs text-neutral-700 dark:text-neutral-300 hover:text-neutral-800 dark:hover:text-neutral-400 transition-colors ${className}`}
      title={tooltip}
      aria-label={tooltip}
    >
      {relative}
    </time>
  );
}
