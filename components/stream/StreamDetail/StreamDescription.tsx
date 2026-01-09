/**
 * File Name : components/stream/streamDetail/StreamDescription
 * Description : 스트리밍 설명(접기/펼치기, 그라데이션 페이드)
 * Author : 임도헌
 *
 * History
 * 2025.07.31  임도헌   Created   컴포넌트 분리
 * 2025.09.09  임도헌   Modified  aria-expanded/controls, 개행 보존
 * 2025.09.15  임도헌   Modified  line-clamp 기반 접기/펼치기 + 페이드/피드백 버튼 UI
 * 2025.11.16  임도헌   Modified  compact/줄수/여백/className 확장
 */

"use client";

import { useEffect, useId, useRef, useState } from "react";

interface StreamDescriptionProps {
  description?: string | null;
  /** 접힌 상태에서 보여줄 줄 수 (기본 2줄 = compact에 최적) */
  collapsedLines?: 2 | 3 | 4 | 5;
  /** 컴팩트 모드(상단/하단 여백 축소) */
  compact?: boolean;
  /** 버튼 문구 커스터마이즈 */
  expandLabel?: string;
  collapseLabel?: string;
  className?: string;
}

export default function StreamDescription({
  description,
  collapsedLines = 2,
  compact = true,
  expandLabel = "더보기",
  collapseLabel = "접기",
  className = "",
}: StreamDescriptionProps) {
  const contentId = useId();
  const desc = (description ?? "").trim();
  const [expanded, setExpanded] = useState(false);
  const [isOverflow, setIsOverflow] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // 접힌 상태에서 실제로 넘치는지 계산 → 짧으면 버튼 숨김
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (expanded) {
      setIsOverflow(true);
      return;
    }
    const t = setTimeout(() => {
      if (!el) return;
      setIsOverflow(el.scrollHeight - 1 > el.clientHeight);
    }, 0);
    return () => clearTimeout(t);
  }, [desc, collapsedLines, expanded]);

  if (!desc) return null;

  const clampClass =
    collapsedLines === 5
      ? "line-clamp-5"
      : collapsedLines === 4
        ? "line-clamp-4"
        : collapsedLines === 3
          ? "line-clamp-3"
          : "line-clamp-2";

  return (
    <div className={compact ? "relative mb-2" : "relative mb-3"}>
      {/* 본문 */}
      <div
        id={contentId}
        ref={ref}
        className={[
          "whitespace-pre-line break-words text-sm",
          "text-neutral-800 dark:text-neutral-100",
          expanded ? "" : clampClass,
          className,
        ].join(" ")}
      >
        {desc}
      </div>

      {/* 접힌 상태일 때만 페이드 */}
      {!expanded && isOverflow && (
        <div
          aria-hidden
          className="
            pointer-events-none absolute inset-x-0 -bottom-0 h-8
            bg-gradient-to-t from-white to-transparent
            dark:from-neutral-900
          "
        />
      )}

      {/* 액션 버튼(오른쪽 정렬, 작게) */}
      {isOverflow && (
        <div
          className={
            compact ? "mt-1 flex justify-end" : "mt-2 flex justify-end"
          }
        >
          <button
            type="button"
            aria-expanded={expanded}
            aria-controls={contentId}
            onClick={() => setExpanded((v) => !v)}
            className="
              inline-flex items-center gap-1 rounded-full
              border border-neutral-300 px-2.5 py-1 text-[11px] font-medium
              text-neutral-700 hover:bg-neutral-50
              dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800
            "
          >
            {expanded ? (
              <>
                {collapseLabel}
                <span aria-hidden>▲</span>
              </>
            ) : (
              <>
                {expandLabel}
                <span aria-hidden>▼</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
