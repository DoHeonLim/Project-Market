/**
 * File Name : components/stream/StreamSearchBarWrapper
 * Description : 스트리밍 전용 검색바 Wrapper (URL 쿼리 push)
 * Author : 임도헌
 *
 * History
 * 2025.08.25  임도헌   Created   posts의 StreamSearchBarWrapper 동일 컨셉
 * 2025.09.10  임도헌   Modified  a11y(role/label), 중복 push 방지, ESC/초기화 버튼, 모바일 키보드 힌트
 * 2025.11.23  임도헌   Modified  모바일 UI 수정
 */

"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useRef, useState } from "react";

export default function StreamSearchBarWrapper() {
  const router = useRouter();
  const sp = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);

  // 현재 keyword (URL 기준)
  const keywordFromUrl = sp.get("keyword") ?? "";
  const [hasText, setHasText] = useState<boolean>(keywordFromUrl.length > 0);

  // scope/category는 유지하면서 keyword만 갱신하는 빌더
  const buildQuery = useMemo(() => {
    return (nextKeyword: string) => {
      const params = new URLSearchParams(sp.toString());
      if (nextKeyword) params.set("keyword", nextKeyword);
      else params.delete("keyword");
      return params.toString();
    };
  }, [sp]);

  const submit = (nextKeyword: string) => {
    // 동일 쿼리라면 네비게이션 생략
    const next = buildQuery(nextKeyword);
    if (next === sp.toString()) return;

    // 제출 후 모바일 키보드 내려 UX 개선
    inputRef.current?.blur();

    router.push(next ? `/streams?${next}` : "/streams");
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const keyword = inputRef.current?.value?.trim() ?? "";
    submit(keyword);
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHasText(e.target.value.length > 0);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      // ESC로 초기화
      e.currentTarget.value = "";
      setHasText(false);
      submit(""); // 즉시 반영 (원하면 제거 가능)
    }
  };

  const clear = () => {
    if (!inputRef.current) return;
    inputRef.current.value = "";
    setHasText(false);
    submit("");
  };

  return (
    <form role="search" onSubmit={onSubmit} className="relative w-full">
      {/* 시각적으로 숨긴 라벨 (a11y) */}
      <label htmlFor="stream-search" className="sr-only">
        스트리밍 검색
      </label>
      <input
        id="stream-search"
        ref={inputRef}
        type="text"
        defaultValue={keywordFromUrl}
        placeholder="스트리밍 검색"
        onChange={onChange}
        onKeyDown={onKeyDown}
        enterKeyHint="search"
        autoComplete="off"
        spellCheck={false}
        className="
          w-full rounded-md border border-neutral-300 dark:border-neutral-600
          px-3 py-1.5 sm:py-2                
          text-[13px] sm:text-sm
          shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500
          dark:bg-neutral-800 dark:text-white appearance-none
        "
      />

      {/* 초기화 버튼(X) — 텍스트가 있을 때만 표시 */}
      {hasText && (
        <button
          type="button"
          onClick={clear}
          aria-label="검색어 지우기"
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-700"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 20 20"
            aria-hidden="true"
            focusable="false"
          >
            <path
              fill="currentColor"
              d="M11.414 10l3.89-3.889a1 1 0 10-1.415-1.414L10 8.586 6.111 4.697A1 1 0 104.697 6.11L8.586 10l-3.89 3.889a1 1 0 101.415 1.414L10 11.414l3.889 3.889a1 1 0 001.414-1.414L11.414 10z"
            />
          </svg>
        </button>
      )}
    </form>
  );
}
