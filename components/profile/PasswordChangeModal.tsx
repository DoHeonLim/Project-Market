/**
 * File Name : components/profile/PasswordChangeModal
 * Description : 비밀번호 변경 모달 컴포넌트
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2024.11.28  임도헌   Created
 * 2024.11.28  임도헌   Modified  비밀번호 변경 모달 컴포넌트 추가
 * 2024.12.17  임도헌   Modified  비밀번호 변경 모달 디자인 변경(다크모드)
 * 2024.12.29  임도헌   Modified  비밀번호 변경 모달 스타일 재 변경
 * 2024.12.30  임도헌   Modified  비밀번호 변경 모달 modals폴더로 이동
 * 2025.10.10  임도헌   Modified  passwordToggle 레이아웃 수정
 * 2025.10.29  임도헌   Modified  onSubmit 연결 수정(action→onSubmit), 제출 중 중복 방지, id/label 연결, autoComplete/aria-pressed 보강, 예외 토스트 추가
 * 2025.12.09  임도헌   Modified  서버 에러(_ 키) 토스트 처리 및 필드 에러 매핑 보강
 * 2025.12.12  임도헌   Modified  모달 UX 표준화(ESC/스크롤락/포커스복원/overlay 버블링 방지/제출중 닫기 가드),
 *                                 password 표시/숨기기 버튼을 Input(passwordToggle)로 위임하여 중복 UI 제거
 */

"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import Input from "../common/Input";
import Button from "../common/Button";
import {
  passwordChangeSchema,
  type PasswordUpdateType,
} from "@/lib/profile/form/passwordChangeSchema";
import { changePassword } from "@/lib/profile/update/changePassword";

type PasswordChangeModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function PasswordChangeModal({
  isOpen,
  onClose,
}: PasswordChangeModalProps) {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const restoreFocusEl = useRef<HTMLElement | null>(null);

  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors },
  } = useForm<PasswordUpdateType>({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: {
      currentPassword: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  const doClose = () => {
    // 제출 중에는 UX 혼선을 막기 위해 닫기 방지 (원하면 이 가드 제거 가능)
    if (submitting) return;
    reset();
    onClose();
  };

  // ESC 닫기 + 스크롤 락 + 포커스 복원
  useEffect(() => {
    if (!isOpen) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") doClose();
    };
    window.addEventListener("keydown", onKey);

    restoreFocusEl.current = document.activeElement as HTMLElement | null;
    dialogRef.current?.focus();

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      restoreFocusEl.current?.focus?.();
    };
    // doClose는 submitting 의존이라서, isOpen/submitting으로 충분히 안정화
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, submitting]);

  const onSubmit = handleSubmit(async (data: PasswordUpdateType) => {
    if (submitting) return;
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("currentPassword", data.currentPassword);
      formData.append("password", data.password);
      formData.append("confirmPassword", data.confirmPassword);

      const response = await changePassword(formData);

      if (!response.success) {
        if (response.errors) {
          const { _, ...fieldErrors } = response.errors;

          Object.entries(fieldErrors).forEach(([field, messages]) => {
            const message = Array.isArray(messages) ? messages[0] : messages;
            if (!message) return;

            setError(field as keyof PasswordUpdateType, {
              type: "manual",
              message,
            });
          });

          if (_ && _.length > 0) toast.error(_[0]);
        } else {
          toast.error(
            "비밀번호 변경에 실패했습니다. 잠시 후 다시 시도해 주세요."
          );
        }
        return;
      }

      toast.success("비밀 항해 코드를 성공적으로 변경했습니다.");
      reset();
      onClose();
    } catch (e) {
      console.error(e);
      toast.error(
        "알 수 없는 오류가 발생했습니다. 잠시 후 다시 시도해 주세요."
      );
    } finally {
      setSubmitting(false);
    }
  });

  if (!isOpen) return null;

  const titleId = "password-change-modal-title";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* overlay */}
      <div
        className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm"
        onClick={doClose}
        aria-hidden="true"
      />

      {/* dialog */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="relative bg-white dark:bg-neutral-800 rounded-xl shadow-xl w-full max-w-md mx-4 animate-fade-in"
        // overlay 클릭 버블링 방지 (컨텐츠 클릭으로 닫히는 케이스 제거)
        onClick={(e) => e.stopPropagation()}
      >
        {/* header */}
        <div className="flex justify-between items-center px-6 py-4 border-b dark:border-neutral-700">
          <h2
            id={titleId}
            className="text-xl font-semibold text-primary dark:text-primary-light"
          >
            비밀 항해 코드 변경
          </h2>
          <button
            onClick={doClose}
            disabled={submitting}
            className="text-neutral-500 hover:text-neutral-700 disabled:opacity-60 disabled:cursor-not-allowed dark:text-neutral-400 dark:hover:text-neutral-200 transition-colors"
            aria-label="비밀번호 변경 모달 닫기"
            aria-disabled={submitting || undefined}
          >
            ✕
          </button>
        </div>

        {/* form */}
        <form onSubmit={onSubmit} className="p-6 space-y-4">
          {/* 현재 비밀번호 */}
          <div className="space-y-2">
            <label
              htmlFor="currentPassword"
              className="text-sm font-medium text-neutral-700 dark:text-neutral-200"
            >
              현재 비밀 항해 코드
            </label>

            <Input
              id="currentPassword"
              type="password"
              passwordToggle
              required
              autoComplete="current-password"
              placeholder="현재 비밀 항해 코드를 입력하세요."
              {...register("currentPassword")}
              icon={
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              }
              passwordToggleLabels={{
                show: "현재 비밀번호 표시",
                hide: "현재 비밀번호 숨기기",
              }}
            />

            {errors.currentPassword?.message && (
              <p className="text-sm text-rose-600">
                {errors.currentPassword.message}
              </p>
            )}
          </div>

          {/* 새 비밀번호 */}
          <div className="space-y-2">
            <label
              htmlFor="newPassword"
              className="text-sm font-medium text-neutral-700 dark:text-neutral-200"
            >
              새 비밀 항해 코드
            </label>

            <Input
              id="newPassword"
              type="password"
              passwordToggle
              required
              autoComplete="new-password"
              placeholder="소문자, 대문자, 숫자, 특수문자를 포함해야 합니다."
              {...register("password")}
              icon={
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                  />
                </svg>
              }
              passwordToggleLabels={{
                show: "새 비밀번호 표시",
                hide: "새 비밀번호 숨기기",
              }}
            />

            {errors.password?.message && (
              <p className="text-sm text-rose-600">{errors.password.message}</p>
            )}
          </div>

          {/* 새 비밀번호 확인 */}
          <div className="space-y-2">
            <label
              htmlFor="confirmPassword"
              className="text-sm font-medium text-neutral-700 dark:text-neutral-200"
            >
              새 비밀 항해 코드 확인
            </label>

            <Input
              id="confirmPassword"
              type="password"
              passwordToggle
              required
              autoComplete="new-password"
              placeholder="비밀 항해 코드 확인"
              {...register("confirmPassword")}
              icon={
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              }
              passwordToggleLabels={{
                show: "비밀번호 확인 표시",
                hide: "비밀번호 확인 숨기기",
              }}
            />

            {errors.confirmPassword?.message && (
              <p className="text-sm text-rose-600">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t dark:border-neutral-600">
            <button
              type="button"
              onClick={doClose}
              className="px-4 py-2 text-sm font-semibold bg-rose-500 hover:bg-rose-600 dark:bg-rose-700 dark:hover:bg-rose-600 text-white rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={submitting}
              aria-disabled={submitting || undefined}
            >
              취소
            </button>
            <Button
              text={submitting ? "처리 중..." : "수정 완료"}
              disabled={submitting}
            />
          </div>
        </form>
      </div>
    </div>
  );
}
