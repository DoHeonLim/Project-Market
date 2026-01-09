/**
 * File Name : components/stream/StreamDetail/StreamCategoryTags
 * Description : 스트리밍 카테고리 및 태그 뱃지 출력
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2025.07.31  임도헌   Created   컴포넌트 분리
 * 2025.09.09  임도헌   Modified  공백/중복 태그 정리, a11y(role=group), 아이콘 공백 처리
 * 2025.09.15  임도헌   Modified  inline/compact 옵션 추가(한 줄 섞어쓰기 & 작은 pill), 불필요한 mb 제거
 */

"use client";

import { StreamCategory, StreamTag } from "@/types/stream";
import { useMemo } from "react";

interface StreamCategoryTagsProps {
  category?: Pick<StreamCategory, "kor_name" | "icon">;
  tags?: Pick<StreamTag, "name">[];

  /** 제목 밑 메타줄 등에서 한 줄로 섞어쓰고 싶을 때 */
  inline?: boolean;
  /** pill을 작게 */
  compact?: boolean;
}

export default function StreamCategoryTags({
  category,
  tags,
  inline = false,
  compact = true,
}: StreamCategoryTagsProps) {
  const normalizedTags = useMemo(() => {
    const arr = (tags ?? []).map((t) => (t?.name ?? "").trim()).filter(Boolean);
    return Array.from(new Set(arr)); // 중복 제거
  }, [tags]);

  const categoryLabel = category
    ? `${category.icon ? `${category.icon} ` : ""}${category.kor_name}`
    : null;

  const wrapClass = inline
    ? "inline-flex flex-wrap items-center gap-2"
    : "flex flex-wrap items-center gap-2";

  const size = compact ? "px-2 py-0.5 text-[12px]" : "px-2.5 py-1 text-[13px]";

  return (
    <div
      className={wrapClass}
      role="group"
      aria-label="카테고리 및 태그"
      data-has-category={!!categoryLabel}
      data-tag-count={normalizedTags.length}
    >
      {categoryLabel && (
        <span
          className={`rounded-md bg-primary px-2 py-1 text-[12px] text-white ${size}`}
          title={categoryLabel}
        >
          {categoryLabel}
        </span>
      )}

      {normalizedTags.map((name) => (
        <span
          key={name}
          className={`rounded-md px-2 py-1 bg-gray-700 text-white ${size}`}
          title={`#${name}`}
        >
          #{name}
        </span>
      ))}
    </div>
  );
}
