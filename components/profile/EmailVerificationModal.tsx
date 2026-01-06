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
 * 2025.12.12  임도헌   Modified  모달 재오픈 시 useFormState 상태 리셋(key 리마운트),
 *                                 intent 기반 분기(request/resend/verify)로 서버액션 오동작 방지,
 *                                 자동 요청은 open 상승 에지에서 1회만 실행
 * 2026.01.06  임도헌   Modified  쿨다운 UX를 localStorage로도 유지(재오픈/새로고침 즉시 복원) + 서버 응답으로 보정
 */

"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useFormState } from "react-dom";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Input from "../common/Input";
import { verifyEmail } from "@/lib/auth/email/verifyEmail";
import { initialEmailVerifyState } from "@/lib/auth/email/verifyEmailState";

interface EmailVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
}

function EmailVerificationModalInner({
  onClose,
  email,
}: Omit<EmailVerificationModalProps, "isOpen">) {
  const router = useRouter();
  const [state, action] = useFormState(verifyEmail, initialEmailVerifyState);

  const [countdown, setCountdown] = useState(0);
  const lastActionRef = useRef<"request" | "resend" | "verify" | null>(null);
  const successToastShown = useRef(false);

  const maskedEmail = useMemo(() => {
    const [id, domain] = email.split("@");
    if (!domain) return email;
    const head = id.slice(0, 2);
    const tail = id.slice(Math.max(1, id.length - 3));
    return `${head}${"*".repeat(Math.max(1, id.length - 3))}${tail}@${domain}`;
  }, [email]);

  const formatTime = (s: number) =>
    `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  // localStorage 쿨다운 저장 키 (이메일별)
  const cooldownStorageKey = useMemo(() => {
    // email은 외부에서 주입되며, key 충돌만 피하면 됨
    return `bp:email-verify:cooldown-until:${email}`;
  }, [email]);

  const readCooldownRemainingFromStorage = useCallback((): number => {
    if (typeof window === "undefined") return 0;
    try {
      const raw = window.localStorage.getItem(cooldownStorageKey);
      const until = raw ? Number(raw) : 0;
      if (!Number.isFinite(until) || until <= 0) return 0;
      const remaining = Math.ceil((until - Date.now()) / 1000);
      return remaining > 0 ? remaining : 0;
    } catch {
      return 0;
    }
  }, [cooldownStorageKey]);

  const writeCooldownUntilToStorage = useCallback(
    (cooldownRemainingSeconds: number) => {
      if (typeof window === "undefined") return;
      try {
        const now = Date.now();
        const nextUntil = now + Math.max(0, cooldownRemainingSeconds) * 1000;

        const existingRaw = window.localStorage.getItem(cooldownStorageKey);
        const existingUntil = existingRaw ? Number(existingRaw) : 0;

        // 기존 값이 더 길게 남아있으면(클라가 더 엄격) 유지한다.
        const finalUntil =
          Number.isFinite(existingUntil) && existingUntil > nextUntil
            ? existingUntil
            : nextUntil;

        if (finalUntil > now) {
          window.localStorage.setItem(cooldownStorageKey, String(finalUntil));
        } else {
          window.localStorage.removeItem(cooldownStorageKey);
        }
      } catch {
        // ignore
      }
    },
    [cooldownStorageKey]
  );

  const clearCooldownStorage = useCallback(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.removeItem(cooldownStorageKey);
    } catch {
      // ignore
    }
  }, [cooldownStorageKey]);

  // 모달 재오픈/새로고침에도 쿨다운 UX 유지(localStorage) - 서버 쿨다운이 SSOT이며, 클라는 표시/버튼 비활성용
  useEffect(() => {
    const remaining = readCooldownRemainingFromStorage();
    if (remaining > 0) setCountdown(remaining);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 서버 응답 → 카운트다운 동기화 + 토스트
  useEffect(() => {
    if (!state.token) return;

    if (typeof state.cooldownRemaining === "number") {
      setCountdown(state.cooldownRemaining);
      writeCooldownUntilToStorage(state.cooldownRemaining);
    }

    // sent 플래그 기반 토스트 (중복 최소화)
    if (lastActionRef.current === "resend") {
      if (state.sent) toast.success("인증 코드를 재전송했습니다.");
      else if ((state.cooldownRemaining ?? 0) > 0) {
        const mm = Math.floor((state.cooldownRemaining ?? 0) / 60);
        const ss = String((state.cooldownRemaining ?? 0) % 60).padStart(2, "0");
        toast.info(`잠시만요! 재전송은 ${mm}:${ss} 후에 가능합니다.`);
      }
    } else if (lastActionRef.current === "request") {
      if (state.sent) toast.success("인증 코드가 이메일로 전송되었습니다.");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    state.token,
    state.cooldownRemaining,
    state.sent,
    writeCooldownUntilToStorage,
  ]);

  // 1초 카운트다운
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  // 카운트다운이 끝나면 localStorage도 정리
  useEffect(() => {
    if (countdown > 0) return;
    clearCooldownStorage();
  }, [countdown, clearCooldownStorage]);

  // 에러 토스트
  useEffect(() => {
    if (state.error?.formErrors?.length) {
      toast.error(state.error.formErrors[0] ?? "인증에 실패했습니다.");
    }
  }, [state.error]);

  // 성공 처리
  useEffect(() => {
    if (!state.success || successToastShown.current) return;
    successToastShown.current = true;
    toast.success("이메일 인증이 완료되었습니다.");
    clearCooldownStorage();
    onClose();
    router.refresh();
  }, [state.success, onClose, router, clearCooldownStorage]);

  // 열릴 때 1회: "조회/요청(request)"" (쿨다운/기존 토큰 동기화 포함)
  useEffect(() => {
    const fd = new FormData();
    fd.append("email", email);
    fd.append("intent", "request");
    lastActionRef.current = "request";
    action(fd);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email]);

  const handleVerify = useCallback(
    (token: string) => {
      const fd = new FormData();
      fd.append("email", email);
      fd.append("token", token);
      fd.append("intent", "verify");
      lastActionRef.current = "verify";
      action(fd);
    },
    [action, email]
  );

  const handleResend = useCallback(() => {
    const fd = new FormData();
    fd.append("email", email);
    fd.append("intent", "resend");
    lastActionRef.current = "resend";
    action(fd);
  }, [action, email]);

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
        className="relative z-10 w-[92vw] max-w-md rounded-2xl bg-white dark:bg-gray-900 p-6 shadow-xl"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2
              id="email-verify-title"
              className="text-lg font-semibold text-gray-900 dark:text-gray-100"
            >
              이메일 인증
            </h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
              {maskedEmail} 로 전송된 6자리 코드를 입력해주세요.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-2 py-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="닫기"
          >
            ✕
          </button>
        </div>

        <div className="mt-5">
          {state.token ? (
            <>
              <Input
                name="token"
                placeholder="6자리 인증 코드"
                maxLength={6}
                inputMode="numeric"
                pattern="[0-9]{6}"
                icon={
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 11c0 .552-.448 1-1 1H9c-.552 0-1-.448-1-1V9c0-.552.448-1 1-1h2c.552 0 1 .448 1 1v2zm0 0v6m8-6V9a4 4 0 00-4-4H8a4 4 0 00-4 4v2a4 4 0 004 4h2m6 6h2a4 4 0 004-4v-2a4 4 0 00-4-4h-2m-6 0h6"
                    />
                  </svg>
                }
                onChange={(e) => {
                  const v =
                    e.target.value?.replace(/\D/g, "").slice(0, 6) ?? "";
                  // 강제 정규화
                  e.target.value = v;
                  if (v.length === 6) handleVerify(v);
                }}
              />

              <div className="mt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                >
                  닫기
                </button>
              </div>

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
      </div>
    </div>
  );
}

export default function EmailVerificationModal({
  isOpen,
  onClose,
  email,
}: EmailVerificationModalProps) {
  // 모달을 닫았다가 열 때 useFormState state를 완전히 초기화하기 위해 key 리마운트 사용
  const [openSeq, setOpenSeq] = useState(0);
  const prevOpen = useRef(false);

  useEffect(() => {
    if (isOpen && !prevOpen.current) setOpenSeq((v) => v + 1);
    prevOpen.current = isOpen;
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <EmailVerificationModalInner
      key={`${email}-${openSeq}`}
      onClose={onClose}
      email={email}
    />
  );
}
