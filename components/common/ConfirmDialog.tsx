/**
 * File Name : components/common/ConfirmDialog
 * Description : 삭제 등을 위한 공용 모달
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2025.08.21  임도헌   Created   기본 확인/취소, 로딩/비활성화, Esc/외부클릭 닫기
 * 2025.09.09  임도헌   Modified  a11y(alertdialog/aria-describedby), 포커스 트랩/복원, 바디 스크롤 잠금, 로딩 중 닫힘 차단
 */
"use client";

import { useEffect, useRef } from "react";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "확인",
  cancelLabel = "취소",
  onConfirm,
  onCancel,
  loading = false,
}: ConfirmDialogProps) {
  const firstRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const prevFocusedRef = useRef<HTMLElement | null>(null);
  const descId = description ? "confirm-desc" : undefined;

  // 포커스 진입/복원 + 바디 스크롤 잠금
  useEffect(() => {
    if (!open) return;
    prevFocusedRef.current = document.activeElement as HTMLElement | null;

    const t = setTimeout(() => firstRef.current?.focus(), 0);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      clearTimeout(t);
      document.body.style.overflow = prevOverflow;
      // 닫히면 이전 포커스로 복귀
      prevFocusedRef.current?.focus?.();
    };
  }, [open]);

  // ESC + 포커스 트랩(Tab 순환)
  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (!loading) onCancel();
        return;
      }
      if (e.key === "Tab" && panelRef.current) {
        const focusables = panelRef.current.querySelectorAll<HTMLElement>(
          'a,button,input,textarea,select,details,[tabindex]:not([tabindex="-1"])'
        );
        const list = Array.from(focusables).filter(
          (el) => !el.hasAttribute("disabled")
        );
        if (list.length === 0) return;

        const first = list[0];
        const last = list[list.length - 1];
        const active = document.activeElement as HTMLElement | null;

        if (!e.shiftKey && active === last) {
          e.preventDefault();
          first.focus();
        } else if (e.shiftKey && active === first) {
          e.preventDefault();
          last.focus();
        }
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, loading, onCancel]);

  if (!open) return null;

  const onBackdropClick = () => {
    if (!loading) onCancel();
  };

  const stop = (e: React.MouseEvent) => e.stopPropagation();

  return (
    <div className="fixed inset-0 z-[60]" onClick={onBackdropClick}>
      <div className="absolute inset-0 bg-black/50" aria-hidden="true" />
      <div
        ref={panelRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby={descId}
        className="relative mx-auto mt-40 w-[min(480px,92vw)] rounded-2xl bg-white p-6 shadow-xl dark:bg-neutral-900"
        onClick={stop}
      >
        <h3
          id="confirm-title"
          className="text-lg font-semibold text-neutral-900 dark:text-neutral-100"
        >
          {title}
        </h3>

        {description && (
          <p
            id={descId}
            className="mt-2 text-sm text-neutral-600 dark:text-neutral-400"
          >
            {description}
          </p>
        )}

        <div className="mt-6 flex justify-end gap-2">
          <button
            ref={firstRef}
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-xl px-4 py-2 text-sm text-neutral-700 hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 dark:text-neutral-300 dark:hover:bg-white/5"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
          >
            {loading ? "처리 중..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
