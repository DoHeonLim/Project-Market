/**
 * File Name : components/stream/streamDetail/StreamDescription
 * Description : 스트리밍 설명(접기/펼치기, 그라데이션 페이드)
 * Author : 임도헌
 *
 * History
 * 2025.07.31  임도헌   Created   컴포넌트 분리
 * 2025.09.09  임도헌   Modified  aria-expanded/controls, 개행 보존
 * 2025.09.15  임도헌   Modified  line-clamp 기반 접기/펼치기 + 페이드/피드백 버튼 UI
 */

"use client";

import { useEffect, useId, useRef, useState } from "react";

interface StreamDescriptionProps {
  description?: string | null;
  /** 접힌 상태에서 보여줄 줄 수 */
  collapsedLines?: 3 | 4 | 5;
  /** 버튼 문구 커스터마이즈 */
  expandLabel?: string;
  collapseLabel?: string;
}

export default function StreamDescription({
  description,
  collapsedLines = 3,
  expandLabel = "더보기",
  collapseLabel = "접기",
}: StreamDescriptionProps) {
  const contentId = useId();
  const desc = (description ?? "").trim();
  const [expanded, setExpanded] = useState(false);
  const [isOverflow, setIsOverflow] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // 길이 측정으로 실제로 넘치는지 판단 (짧으면 버튼 숨김)
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // 접힌 상태에서만 오버플로우 계산
    const prev = expanded;
    if (prev) {
      setIsOverflow(true);
      return;
    }

    // 약간의 지연 후 측정(렌더/폰트 적용 고려)
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
        : "line-clamp-3";

  return (
    <div className="relative mb-3">
      {/* 본문 */}
      <div
        id={contentId}
        ref={ref}
        className={[
          "whitespace-pre-line break-words text-sm text-neutral-800 dark:text-neutral-100",
          expanded ? "" : clampClass,
        ].join(" ")}
      >
        {desc}
      </div>

      {/* 접힌 상태일 때만 페이드 표시 */}
      {!expanded && isOverflow && (
        <div
          aria-hidden
          className="
            pointer-events-none absolute inset-x-0 -bottom-0 h-10
            bg-gradient-to-t from-white to-transparent
            dark:from-neutral-900
          "
        />
      )}

      {/* 액션 버튼 */}
      {isOverflow && (
        <div className="mt-2 flex justify-end">
          <button
            type="button"
            aria-expanded={expanded}
            aria-controls={contentId}
            onClick={() => setExpanded((v) => !v)}
            className="
              inline-flex items-center gap-1 rounded-full
              border border-neutral-300 px-3 py-1 text-xs font-medium
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
