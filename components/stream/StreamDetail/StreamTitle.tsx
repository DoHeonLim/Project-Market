/**
 * File Name : components/stream/streamDetail/StreamTitle
 * Description : 스트리밍 작성자 아바타 및 제목 출력 섹션
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2025.07.31  임도헌   Created   컴포넌트 분리
 * 2025.09.09  임도헌   Modified  제목 시맨틱(<h1>), 긴 제목 가독성(break/line-clamp), 툴팁/널가드
 */

"use client";

interface StreamTitleProps {
  title?: string | null;
  className?: string;
}

export default function StreamTitle({
  title,
  className = "",
}: StreamTitleProps) {
  const safeTitle = title?.trim() || "(제목 없음)";
  return (
    <h1
      className={`mb-2 max-w-full break-words text-lg font-bold leading-tight text-neutral-900 dark:text-white md:text-xl line-clamp-2 ${className}`}
      title={safeTitle}
    >
      {safeTitle}
    </h1>
  );
}
