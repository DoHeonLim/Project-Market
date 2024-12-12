/**
File Name : components/password-change-modal
Description : 비밀번호 변경 모달 컴포넌트
Author : 임도헌

History
Date        Author   Status    Description
2024.11.28  임도헌   Created
2024.11.28  임도헌   Modified  비밀번호 변경 모달 컴포넌트 추가
*/

"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  passwordUpdateSchema,
  PasswordUpdateType,
} from "@/app/(tabs)/profile/schema";
import Input from "./input";
import Button from "./button";
import { changePassword } from "@/app/(tabs)/profile/actions";
import { useState } from "react";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/solid";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-neutral-600 rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h2 className="text-xl font-semibold">비밀번호 변경</h2>
          <button
            onClick={() => {
              reset();
              onClose();
            }}
            className="text-white hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <form action={onValid} className="space-y-4">
          <label htmlFor="password" className="my-2">
            현재 비밀번호
          </label>
          <div className="relative">
            <Input
              id="currentPassword"
              type={showCurrentPassword ? "text" : "password"}
              required
              placeholder="현재 비밀번호를 입력하세요."
              {...register("currentPassword")}
              errors={[errors.currentPassword?.message ?? ""]}
            />
            <button
              type="button"
              onClick={() => handlePasswordToggle("currentPassword")}
              className="absolute right-3 top-5 transform -translate-y-1/2 text-neutral-200"
            >
              {showCurrentPassword ? (
                <EyeIcon className="size-4" />
              ) : (
                <EyeSlashIcon className="size-4" />
              )}
            </button>
          </div>
          <label htmlFor="password" className="my-2">
            새 비밀번호
          </label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              required
              placeholder="대소문자, 숫자, 특수문자를 포함해야 합니다."
              {...register("password")}
              errors={[errors.password?.message ?? ""]}
            />
            <button
              type="button"
              onClick={() => handlePasswordToggle("password")}
              className="absolute right-3 top-5 transform -translate-y-1/2 text-neutral-200"
            >
              {showPassword ? (
                <EyeIcon className="size-4" />
              ) : (
                <EyeSlashIcon className="size-4" />
              )}
            </button>
          </div>
          <label htmlFor="password" className="my-2">
            새 비밀번호
          </label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              required
              placeholder="대소문자, 숫자, 특수문자를 포함해야 합니다."
              {...register("confirmPassword")}
              errors={[errors.confirmPassword?.message ?? ""]}
            />
            <button
              type="button"
              onClick={() => handlePasswordToggle("confirmPassword")}
              className="absolute right-3 top-5 transform -translate-y-1/2 text-neutral-200"
            >
              {showConfirmPassword ? (
                <EyeIcon className="size-4" />
              ) : (
                <EyeSlashIcon className="size-4" />
              )}
            </button>
          </div>
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <button
              type="button"
              onClick={() => {
                reset();
                onClose();
              }}
              className="w-1/3 py-2 text-sm font-medium bg-rose-600 rounded-md hover:bg-rose-400 focus:outline-none focus:ring-2 focus:ring-white disabled:opacity-50"
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
