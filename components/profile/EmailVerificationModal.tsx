/**
File Name : components/profile/EmailVerificationModal
Description : 이메일 인증 모달
Author : 임도헌

History
Date        Author   Status    Description
2025.04.13  임도헌   Created
2025.04.21  임도헌   Modified  성공상태를 감지하여 모달을 닫고 페이지를 새로고침하도록 수정
2025.
*/

"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import Input from "../common/Input";
import Button from "../common/Button";
import { useFormState } from "react-dom";
import { verifyEmail } from "@/app/api/email/actions";

const initialState = {
  token: false,
  email: "",
  error: undefined,
  success: false,
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
  const [state, action] = useFormState(verifyEmail, initialState);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (state.token) {
      toast.success("인증 코드가 이메일로 전송되었습니다.");
      // 3분(180초) 타이머 시작
      setCountdown(180);
    }
  }, [state.token]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  useEffect(() => {
    if (state.error) {
      toast.error(state.error.formErrors?.[0] || "인증에 실패했습니다.");
    }
  }, [state.error]);

  // email인증 성공 시 모달 닫고 새로 고침 하도록 수정
  useEffect(() => {
    if (state.success) {
      toast.success("이메일 인증이 완료되었습니다.");
      onClose();
      // 페이지 새로고침
      window.location.reload();
    }
  }, [state.success, onClose]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const handleResend = async () => {
    if (countdown > 0) return;

    const formData = new FormData();
    formData.append("email", email);
    formData.append("resend", "true");

    action(formData);
  };

  // 모달이 열릴 때 자동으로 인증 코드 보내기
  useEffect(() => {
    if (isOpen && !state.token) {
      const formData = new FormData();
      formData.append("email", email);
      action(formData);
    }
  }, [isOpen, email, action, state.token]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-white dark:bg-neutral-800 rounded-xl shadow-xl w-full max-w-md mx-4 animate-fade-in">
        {/* 헤더 */}
        <div className="flex justify-between items-center px-6 py-4 border-b dark:border-neutral-700">
          <h2 className="text-xl font-semibold text-primary dark:text-primary-light">
            이메일 인증
          </h2>
          <button
            onClick={onClose}
            className="text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* 폼 */}
        <form action={action} className="pb-6 px-4 space-y-4">
          <input type="hidden" name="email" value={email} />
          <div className="space-y-2">
            <p className="text-sm text-neutral-700 dark:text-neutral-200 px-2 pb-4">
              {email}로 전송된 6자리 인증 코드를 입력해주세요.
            </p>
            {state.token ? (
              <>
                <Input
                  key="token"
                  name="token"
                  type="number"
                  placeholder="6자리 숫자 입력"
                  minLength={100000}
                  maxLength={999999}
                  errors={state.error?.formErrors}
                  required
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
                  >
                    {countdown > 0
                      ? `재전송 가능까지 ${formatTime(countdown)}`
                      : "인증 코드 재전송"}
                  </button>
                </div>
              </>
            ) : (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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
