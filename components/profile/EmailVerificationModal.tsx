/**
 * File Name : components/profile/EmailVerificationModal
 * Description : 이메일 인증 모달
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2025.04.13  임도헌   Created
 * 2025.04.21  임도헌   Modified  성공상태를 감지하여 모달을 닫고 페이지를 새로고침하도록 수정
 * 2025.10.14  임도헌   Modified  UX/타이머/토스트 개선
 * 2025.10.29  임도헌   Modified  재전송 쿨다운 서버 고정(3분) 및 모달 닫아도 유지,
 *                                 cooldownRemaining/sent 플래그 도입, 토스트 중복 방지,
 *                                 입력 pattern을 [0-9]{6}으로 안전 적용
 */
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFormState } from "react-dom";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Input from "../common/Input";
import Button from "../common/Button";
import { verifyEmail } from "@/lib/auth/email/verifyEmail";

const initialState = {
  token: false,
  email: "",
  error: undefined as { formErrors?: string[] } | undefined,
  success: false,
  cooldownRemaining: undefined as number | undefined,
  sent: false,
};

interface EmailVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
}

export default function EmailVerificationModal({
  isOpen,
  onClose,
  email,
}: EmailVerificationModalProps) {
  const router = useRouter();
  const [state, action] = useFormState(verifyEmail, initialState);

  const [countdown, setCountdown] = useState(0);
  const successToastShown = useRef(false);
  const lastActionRef = useRef<"auto" | "resend" | null>(null);

  // 모달 닫혀도 쿨다운을 리셋하지 않음 (서버가 강제)
  useEffect(() => {
    if (!isOpen) {
      successToastShown.current = false; // 성공 토스트만 초기화
    }
  }, [isOpen]);

  // 서버 응답에 따라 토스트/카운트다운 갱신
  useEffect(() => {
    if (!state.token) return;

    // 서버에서 남은 쿨다운 내려오면 동기화
    if (typeof state.cooldownRemaining === "number") {
      setCountdown(state.cooldownRemaining);
    }

    // 최초 발송/재전송 토스트 제어
    if (lastActionRef.current === "resend") {
      if (state.sent) {
        toast.success("인증 코드를 재전송했습니다.");
      } else if (
        typeof state.cooldownRemaining === "number" &&
        state.cooldownRemaining > 0
      ) {
        const mm = Math.floor(state.cooldownRemaining / 60);
        const ss = String(state.cooldownRemaining % 60).padStart(2, "0");
        toast.info(`잠시만요! 재전송은 ${mm}:${ss} 후에 가능합니다.`);
      }
    } else if (lastActionRef.current === "auto") {
      if (state.sent) {
        toast.success("인증 코드가 이메일로 전송되었습니다.");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.token, state.cooldownRemaining, state.sent]);

  // 1초 카운트다운
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  // 에러 알림
  useEffect(() => {
    if (state.error?.formErrors?.length) {
      toast.error(state.error.formErrors[0] ?? "인증에 실패했습니다.");
    }
  }, [state.error]);

  // 성공 처리
  useEffect(() => {
    if (state.success && !successToastShown.current) {
      successToastShown.current = true;
      toast.success("이메일 인증이 완료되었습니다.");
      onClose();
      router.refresh();
    }
  }, [state.success, onClose, router]);

  // 모달 열릴 때 자동 발송(또는 기존 토큰/쿨다운 조회)
  useEffect(() => {
    if (isOpen) {
      const fd = new FormData();
      fd.append("email", email);
      lastActionRef.current = "auto";
      action(fd);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, email]);

  const maskedEmail = useMemo(() => {
    const [id, domain] = email.split("@");
    if (!domain) return email;
    const head = id.slice(0, 2);
    const tail = id.length > 4 ? id.slice(-1) : "";
    return `${head}${"*".repeat(Math.max(1, id.length - 3))}${tail}@${domain}`;
  }, [email]);

  const formatTime = (s: number) =>
    `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  const handleResend = () => {
    const fd = new FormData();
    fd.append("email", email);
    fd.append("resend", "true");
    lastActionRef.current = "resend";
    action(fd);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="email-verify-title"
        className="relative bg-white dark:bg-neutral-800 rounded-xl shadow-xl w-full max-w-md mx-4 animate-fade-in"
      >
        {/* 헤더 */}
        <div className="flex justify-between items-center px-6 py-4 border-b dark:border-neutral-700">
          <h2
            id="email-verify-title"
            className="text-xl font-semibold text-primary dark:text-primary-light"
          >
            이메일 인증
          </h2>
          <button
            onClick={onClose}
            className="text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 transition-colors"
            aria-label="닫기"
          >
            ✕
          </button>
        </div>

        {/* 폼 */}
        <form action={action} className="pb-6 px-4 space-y-4">
          <input type="hidden" name="email" value={email} />
          <div className="space-y-2">
            <p className="text-sm text-neutral-700 dark:text-neutral-200 px-2 pb-4">
              {maskedEmail} 로 전송된 6자리 인증 코드를 입력해주세요.
            </p>

            {state.token ? (
              <>
                <Input
                  key="token"
                  name="token"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  placeholder="6자리 숫자 입력"
                  required
                  aria-label="인증번호 6자리"
                  icon={
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                  }
                />
                <div className="flex justify-end mt-2">
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={countdown > 0}
                    className={`text-sm ${
                      countdown > 0
                        ? "text-gray-400 dark:text-gray-500"
                        : "text-primary dark:text-primary-light hover:underline"
                    }`}
                    aria-disabled={countdown > 0 || undefined}
                  >
                    {countdown > 0
                      ? `재전송 가능까지 ${formatTime(countdown)}`
                      : "인증 코드 재전송"}
                  </button>
                </div>
              </>
            ) : (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2 pt-4 border-t dark:border-neutral-600">
            <Button text={state.token ? "인증하기" : "인증 코드 보내기"} />
          </div>
        </form>
      </div>
    </div>
  );
}
