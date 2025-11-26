/**
 * File Name : components/stream/PrivateAccessModal
 * Description : 비공개 스트림 접근 비밀번호 입력 모달 (구 디자인 적용)
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2025.08.19  임도헌   Created   비공개 스트림 접근 비밀번호 모달 컴포넌트
 * 2025.08.30  임도헌   Modified  redirectHref/onSuccess 추가, 성공 시 자동 이동 지원
 * 2025.09.03  임도헌   Modified  에러코드별 UX 분기(로그인 유도/리프레시/리다이렉트) 적용
 * 2025.09.05  임도헌   Modified  redirectHref 미지정 시 상세로 fallback push + login next 기본값 지정
 * 2025.09.05  임도헌   Modified  (a11y) ESC 닫기/포커스 트랩/스크롤 락/autoComplete 보강
 * 2025.09.10  임도헌   Modified  진행 중 닫기 가드(ESC/배경/취소), a11y 보강(htmlFor/id, role="alert"), 라우팅 중복 정리
 * 2025.09.10  임도헌   Modified  열릴 때 현재 포커스 요소를 저장했다가 닫을 때 복귀
 */

"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { unlockPrivateStreamAction } from "@/app/(tabs)/streams/actions/private";
import { unlockErrorMessage } from "@/types/stream";

interface PrivateAccessModalProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  streamId: number;
  /** 성공 시 이동할 경로(옵션). 없으면 상세(`/streams/{id}`)로 이동 */
  redirectHref?: string;
  /** 성공 시 추가 작업(옵션). redirect 전에 호출 */
  onSuccess?: () => void;
}

export default function PrivateAccessModal({
  open,
  onOpenChange,
  streamId,
  redirectHref,
  onSuccess,
}: PrivateAccessModalProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const lastActiveElRef = useRef<HTMLElement | null>(null); // 실제로 저장해서 복귀

  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const targetHref = redirectHref ?? `/streams/${streamId}`;
  const close = useCallback(() => onOpenChange(false), [onOpenChange]);

  useEffect(() => {
    if (!open) {
      setPassword("");
      setError("");
      return;
    }

    // 열릴 때 현재 포커스 저장
    lastActiveElRef.current = document.activeElement as HTMLElement | null;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const t = setTimeout(() => inputRef.current?.focus(), 0);

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        if (!isPending) close();
        return;
      }
      if (e.key === "Tab" && modalRef.current) {
        const focusables = modalRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
        );
        const list = Array.from(focusables).filter(
          (el) => !el.hasAttribute("disabled")
        );
        if (list.length === 0) return;

        const first = list[0];
        const last = list[list.length - 1];
        const active = document.activeElement;

        if (e.shiftKey && active === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && active === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      clearTimeout(t);
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
      // 닫을 때 포커스 복귀
      lastActiveElRef.current?.focus?.();
      lastActiveElRef.current = null;
    };
  }, [open, isPending, close]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isPending) return;

    const pwd = password.trim();
    if (!pwd) {
      setError("비밀번호를 입력해주세요.");
      return;
    }
    setError("");

    startTransition(async () => {
      const res = await unlockPrivateStreamAction(streamId, pwd);

      if (!res.success) {
        const code = res.error;
        const msg = unlockErrorMessage[code] ?? "접근에 실패했습니다.";

        switch (code) {
          case "NOT_LOGGED_IN": {
            close();
            router.push(`/login?callbackUrl=${encodeURIComponent(targetHref)}`);
            return;
          }
          case "STREAM_NOT_FOUND": {
            close();
            router.replace("/streams");
            return;
          }
          case "NOT_PRIVATE_STREAM":
          case "NO_PASSWORD_SET": {
            // 이동만으로 최신 상태 렌더 → refresh 불필요
            close();
            router.replace(targetHref);
            return;
          }
          case "INVALID_PASSWORD":
          case "BAD_REQUEST":
          case "MISSING_PASSWORD":
          default: {
            setError(msg);
            return;
          }
        }
      }

      // 성공: 이동으로 충분 (세션 기반 가드라 새 페이지에서 최신 상태 반영됨)
      close();
      onSuccess?.();
      router.push(targetHref);
    });
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70"
      role="dialog"
      aria-modal="true"
      aria-labelledby={`private-modal-title-${streamId}`}
      aria-busy={isPending || undefined}
      onClick={() => {
        if (!isPending) close();
      }}
    >
      <div
        ref={modalRef}
        className="mx-4 w-full max-w-sm rounded-lg bg-white p-6 dark:bg-neutral-800"
        onClick={(e) => e.stopPropagation()}
      >
        <h3
          id={`private-modal-title-${streamId}`}
          className="mb-4 text-lg font-semibold text-neutral-900 dark:text-white"
        >
          비공개 스트리밍
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor={`private-password-${streamId}`}
              className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300"
            >
              비밀번호
            </label>
            <input
              id={`private-password-${streamId}`}
              ref={inputRef}
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError(""); // 입력 시 에러 해제
              }}
              placeholder="비밀번호를 입력하세요"
              className="w-full rounded-md border border-neutral-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-neutral-600 dark:bg-neutral-700 dark:text-white"
              aria-invalid={!!error || undefined}
              aria-describedby={error ? `private-error-${streamId}` : undefined}
              disabled={isPending}
            />
            {error && (
              <p
                id={`private-error-${streamId}`}
                role="alert"
                className="mt-1 text-sm text-red-600 dark:text-red-400"
              >
                {error}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={close}
              disabled={isPending}
              className="rounded-md bg-rose-500 px-4 py-2 text-sm font-medium text-white hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-rose-700"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending ? "확인 중..." : "입장하기"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
