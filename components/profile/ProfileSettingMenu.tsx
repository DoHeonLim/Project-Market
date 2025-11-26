/**
 * File Name : components/profile/ProfileSettingMenu
 * Description : 프로필 설정 드롭다운(프로필 수정 / 비밀 항해 코드 수정 / 이메일 인증)
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2025.11.12  임도헌   Created   상단 우측 드롭다운 신설
 * 2025.11.12  임도헌   Modified  항목 간 구분선/포커스/키보드 내비게이션 보강
 */

"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type Props = {
  emailVerified?: boolean;
};

export default function ProfileSettingMenu({ emailVerified }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // 바깥 클릭/ESC 닫기
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  // 키보드 내비게이션(↑/↓/Home/End)
  useEffect(() => {
    if (!open || !ref.current) return;
    const menu = ref.current.querySelector<HTMLDivElement>('[role="menu"]');
    if (!menu) return;
    const focusables = Array.from(
      menu.querySelectorAll<HTMLElement>(
        '[data-menuitem="true"]:not([aria-disabled="true"])'
      )
    );

    const onKey = (e: KeyboardEvent) => {
      if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(e.key)) return;
      e.preventDefault();
      const active = document.activeElement as HTMLElement | null;
      let idx = focusables.findIndex((el) => el === active);
      if (e.key === "ArrowDown")
        idx = (idx + 1 + focusables.length) % focusables.length;
      if (e.key === "ArrowUp")
        idx = (idx - 1 + focusables.length) % focusables.length;
      if (e.key === "Home") idx = 0;
      if (e.key === "End") idx = focusables.length - 1;
      focusables[idx]?.focus();
    };

    menu.addEventListener("keydown", onKey as unknown as EventListener);
    focusables[0]?.focus();
    return () =>
      menu.removeEventListener("keydown", onKey as unknown as EventListener);
  }, [open]);

  // MyProfile에서 모달을 열도록 이벤트 발행
  const openPassword = () =>
    window.dispatchEvent(new CustomEvent("open-password-modal"));
  const openEmailVerify = () =>
    window.dispatchEvent(new CustomEvent("open-email-verification-modal"));

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        title="설정"
        className="rounded-lg p-2.5 bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-colors shadow-sm"
      >
        <span aria-hidden className="text-xl">
          ⚙️
        </span>
      </button>

      {open && (
        <div
          role="menu"
          aria-label="프로필 설정"
          className="absolute right-0 mt-2 w-52 rounded-xl border border-neutral-200 dark:border-neutral-800
                     bg-white dark:bg-neutral-900 shadow-lg overflow-hidden z-50"
        >
          {/* 항목 1 */}
          <Link
            href="/profile/edit"
            role="menuitem"
            data-menuitem="true"
            tabIndex={0}
            className="block px-3 py-2.5 text-sm text-neutral-900 dark:text-neutral-100
                       hover:bg-neutral-50 dark:hover:bg-neutral-800 focus:outline-none
                       focus-visible:ring-2 focus-visible:ring-primary/60"
            onClick={() => setOpen(false)}
          >
            프로필 수정
          </Link>

          {/* 구분선 */}
          <div
            role="separator"
            className="h-px bg-neutral-200 dark:bg-neutral-800"
          />

          {/* 항목 2 */}
          <button
            role="menuitem"
            data-menuitem="true"
            tabIndex={0}
            onClick={() => {
              setOpen(false);
              openPassword();
            }}
            className="w-full text-left px-3 py-2.5 text-sm text-neutral-900 dark:text-neutral-100
                       hover:bg-neutral-50 dark:hover:bg-neutral-800 focus:outline-none
                       focus-visible:ring-2 focus-visible:ring-primary/60"
          >
            비밀 항해 코드 수정
          </button>

          {/* 구분선 */}
          <div
            role="separator"
            className="h-px bg-neutral-200 dark:bg-neutral-800"
          />

          {/* 항목 3 (이메일) */}
          {emailVerified ? (
            <div
              role="menuitem"
              aria-disabled="true"
              tabIndex={-1}
              className="px-3 py-2.5 text-sm text-neutral-500 dark:text-neutral-400
                         cursor-not-allowed select-none"
            >
              이메일 인증됨
            </div>
          ) : (
            <button
              role="menuitem"
              data-menuitem="true"
              tabIndex={0}
              onClick={() => {
                setOpen(false);
                openEmailVerify();
              }}
              className="w-full text-left px-3 py-2.5 text-sm text-neutral-900 dark:text-neutral-100
                         hover:bg-neutral-50 dark:hover:bg-neutral-800 focus:outline-none
                         focus-visible:ring-2 focus-visible:ring-primary/60"
            >
              이메일 인증
            </button>
          )}
        </div>
      )}
    </div>
  );
}
