/**
 * File Name : components/stream/streamDetail/StreamTitle
 * Description : 스트리밍 작성자 아바타 및 제목 출력 섹션
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2025.07.31  임도헌   Created   컴포넌트 분리
 * 2025.09.09  임도헌   Modified  제목 시맨틱(<h1>), 긴 제목 가독성(break/line-clamp), 툴팁/널가드
 * 2025.11.16  임도헌   Modified  compact/size/className 확장, 여백 축소
 */

"use client";

type Size = "sm" | "md" | "lg";

interface StreamTitleProps {
  title?: string | null;
  /** 라인 높이 & 글자 크기/여백을 줄이는 모드 */
  compact?: boolean;
  /** 글자 크기 프리셋 */
  size?: Size;
  className?: string;
}

export default function StreamTitle({
  title,
  compact = false,
  size = "md",
  className = "",
}: StreamTitleProps) {
  const safeTitle = title?.trim() || "(제목 없음)";

  const sizeClass =
    size === "lg"
      ? "text-lg md:text-xl"
      : size === "sm"
        ? "text-sm md:text-base"
        : "text-base md:text-lg";

  return (
    <h1
      className={[
        // 여백: compact면 더 촘촘
        compact ? "mb-1" : "mb-2",
        "max-w-full break-words font-bold leading-tight",
        "text-neutral-900 dark:text-white",
        // 글자 크기
        sizeClass,
        // 기본은 2줄 클램프(길면 자동 말줄임)
        "line-clamp-3",
        className,
      ].join(" ")}
      title={safeTitle}
    >
      {safeTitle}
    </h1>
  );
}
