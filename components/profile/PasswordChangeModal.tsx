/**
File Name : components/profile/PasswordChangeModal.tsx
Description : 비밀번호 변경 모달 컴포넌트
Author : 임도헌

History
Date        Author   Status    Description
2024.11.28  임도헌   Created
2024.11.28  임도헌   Modified  비밀번호 변경 모달 컴포넌트 추가
2024.12.17  임도헌   Modified  비밀번호 변경 모달 디자인 변경(다크모드)
2024.12.29  임도헌   Modified  비밀번호 변경 모달 스타일 재 변경
2024.12.30  임도헌   Modified  비밀번호 변경 모달 modals폴더로 이동
*/

"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { changePassword } from "@/app/(tabs)/profile/actions";
import { useState } from "react";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/solid";
import {
  passwordUpdateSchema,
  PasswordUpdateType,
} from "@/app/(tabs)/profile/schema";
import Input from "../common/Input";
import Button from "../common/Button";

type PasswordChangeModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function PasswordChangeModal({
  isOpen,
  onClose,
}: PasswordChangeModalProps) {
  // 패스워드 입력 시 보이게 하는 토글 버튼
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors },
  } = useForm<PasswordUpdateType>({
    resolver: zodResolver(passwordUpdateSchema),
    // 초깃값 세팅
    defaultValues: {
      currentPassword: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = handleSubmit(async (data: PasswordUpdateType) => {
    const formData = new FormData();
    formData.append("currentPassword", data.currentPassword);
    formData.append("password", data.password);
    formData.append("confirmPassword", data.confirmPassword);
    const response = await changePassword(formData);

    if (!response.success && response.errors) {
      // 서버에서 반환된 에러를 setError를 사용해 반영
      Object.entries(response.errors).forEach(([field, messages]) => {
        const message = Array.isArray(messages) ? messages[0] : messages; // 배열이면 첫 번째 메시지 사용
        setError(field as keyof PasswordUpdateType, {
          type: "manual",
          message: message,
        });
      });
    } else {
      // 성공 시 폼 초기화 및 모달 닫기
      alert("패스워드를 성공적으로 변경했습니다.");
      reset();
      onClose();
    }
  });

  const onValid = async () => {
    await onSubmit();
  };

  // 패스워드 보이게 하는 함수
  const handlePasswordToggle = (
    field: "currentPassword" | "password" | "confirmPassword"
  ) => {
    if (field === "password") {
      setShowPassword((prev) => !prev);
    } else if (field === "confirmPassword") {
      setShowConfirmPassword((prev) => !prev);
    } else {
      setShowCurrentPassword((prev) => !prev);
    }
  };

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
            비밀 항해 코드 변경
          </h2>
          <button
            onClick={() => {
              reset();
              onClose();
            }}
            className="text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* 폼 */}
        <form action={onValid} className="p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
              현재 비밀 항해 코드
            </label>
            <div className="relative">
              <Input
                type={showCurrentPassword ? "text" : "password"}
                required
                placeholder="현재 비밀 항해 코드를 입력하세요."
                {...register("currentPassword")}
                errors={[errors.currentPassword?.message ?? ""]}
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
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                }
              />
              <button
                type="button"
                onClick={() => handlePasswordToggle("currentPassword")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-300"
              >
                {showCurrentPassword ? (
                  <EyeIcon className="size-5" />
                ) : (
                  <EyeSlashIcon className="size-5" />
                )}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
              새 비밀 항해 코드
            </label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                required
                placeholder="소문자, 대문자, 숫자, 특수문자를 포함해야 합니다."
                {...register("password")}
                errors={[errors.password?.message ?? ""]}
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
                      d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                    />
                  </svg>
                }
              />
              <button
                type="button"
                onClick={() => handlePasswordToggle("password")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-300"
              >
                {showPassword ? (
                  <EyeIcon className="size-5" />
                ) : (
                  <EyeSlashIcon className="size-5" />
                )}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
              새 비밀 항해 코드 확인
            </label>
            <div className="relative">
              <Input
                type={showConfirmPassword ? "text" : "password"}
                required
                placeholder="비밀 항해 코드 확인"
                {...register("confirmPassword")}
                errors={[errors.confirmPassword?.message ?? ""]}
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
              <button
                type="button"
                onClick={() => handlePasswordToggle("confirmPassword")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-300"
              >
                {showConfirmPassword ? (
                  <EyeIcon className="size-5" />
                ) : (
                  <EyeSlashIcon className="size-5" />
                )}
              </button>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t dark:border-neutral-600">
            <button
              type="button"
              onClick={() => {
                reset();
                onClose();
              }}
              className="px-4 py-2 text-sm font-semibold bg-rose-500 hover:bg-rose-600 dark:bg-rose-700 dark:hover:bg-rose-600 text-white rounded-lg transition-colors"
            >
              취소
            </button>
            <Button text="수정 완료" />
          </div>
        </form>
      </div>
    </div>
  );
}
