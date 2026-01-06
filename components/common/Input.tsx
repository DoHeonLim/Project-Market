/**
 * File Name : components/common/Input
 * Description : 폼 인풋 컴포넌트
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2024.10.01  임도헌   Created
 * 2024.10.01  임도헌   Modified  input 컴포넌트 추가
 * 2024.10.04  임도헌   Modified  name props 추가 및 InputHTMLAttributes<HTMLInputElement> 추가
 * 2024.11.11  임도헌   Modified  forwardRef를 사용하는 코드 추가
 * 2024.12.15  임도헌   Modified  textarea 지원 추가
 * 2024.12.24  임도헌   Modified  icon prop 추가
 * 2025.04.10  임도헌   Modified  gap-0으로 변경
 * 2025.12.10  임도헌   Modified  빈 에러 메시지 필터링으로 에러 span 렌더링 로직 개선
 * 2025.12.12  임도헌   Modified  passwordToggle 옵션 추가(비밀번호일 때만 눈 버튼 렌더링)
 */

"use client";

import React, { ForwardedRef, forwardRef, useId, useState } from "react";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/solid";

interface IInputProps
  extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
  label?: string;
  type?: string;
  required?: boolean;
  errors?: string[];
  icon?: React.ReactNode;

  /**
   * 비밀번호 입력일 때만 눈(표시/숨기기) 버튼을 Input 내부에서 제공.
   * - true면 Input이 show/hide를 관리하고, 외부에서 type 토글할 필요 없음.
   */
  passwordToggle?: boolean;

  /** 접근성/문구 커스터마이징 */
  passwordToggleLabels?: {
    show?: string;
    hide?: string;
  };
}

const _Input = (
  {
    errors = [],
    name,
    type = "text",
    className = "",
    icon,
    passwordToggle = false,
    passwordToggleLabels,
    id,
    ...rest
  }: IInputProps,
  ref: ForwardedRef<HTMLInputElement | HTMLTextAreaElement>
) => {
  const filteredErrors = errors.filter(Boolean);
  const autoId = useId();
  const inputId = id ?? (name ? `${name}-${autoId}` : `input-${autoId}`);

  // passwordToggle이 켜져있고 type=password면 Input 내부에서만 표시/숨김 관리
  const canToggle = passwordToggle && type === "password";
  const [revealed, setRevealed] = useState(false);

  if (type === "textarea") {
    return (
      <div className="flex flex-col gap-2 w-full">
        <textarea
          id={inputId}
          ref={ref as ForwardedRef<HTMLTextAreaElement>}
          name={name}
          className={`input-primary min-h-[200px] resize-y p-2 ${className}`}
          aria-invalid={filteredErrors.length > 0 ? "true" : "false"}
          {...rest}
        />
        {filteredErrors.map((error, index) => (
          <span
            key={index}
            className="font-medium text-red-500 dark:text-red-400"
          >
            {error}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-0 w-full">
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text/50 dark:text-text-dark/50">
            {icon}
          </div>
        )}

        <input
          id={inputId}
          ref={ref as ForwardedRef<HTMLInputElement>}
          // 내부 토글이면 password/text를 Input이 결정
          type={canToggle ? (revealed ? "text" : "password") : type}
          name={name}
          aria-invalid={filteredErrors.length > 0 ? "true" : "false"}
          className={`input-primary h-10 w-full ${
            icon ? "pl-10" : "pl-3"
          } ${canToggle ? "pr-10" : ""} ${className}`}
          {...rest}
        />

        {canToggle && (
          <button
            type="button"
            onClick={() => setRevealed((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-300"
            aria-pressed={revealed}
            aria-label={
              revealed
                ? (passwordToggleLabels?.hide ?? "비밀번호 숨기기")
                : (passwordToggleLabels?.show ?? "비밀번호 표시")
            }
          >
            {revealed ? (
              <EyeIcon className="size-5" />
            ) : (
              <EyeSlashIcon className="size-5" />
            )}
          </button>
        )}
      </div>

      {filteredErrors.map((error, index) => (
        <span
          key={index}
          className="font-medium text-red-500 dark:text-red-400 mt-2"
        >
          {error}
        </span>
      ))}
    </div>
  );
};

export default forwardRef(_Input);
