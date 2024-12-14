/**
File Name : components/input
Description : 폼 인풋 컴포넌트
Author : 임도헌

History
Date        Author   Status    Description
2024.10.01  임도헌   Created
2024.10.01  임도헌   Modified  input 컴포넌트 추가
2024.10.04  임도헌   Modified  name props 추가 및 InputHTMLAttributes<HTMLInputElement> 추가
2024.11.11  임도헌   Modified  forwardRef를 사용하는 코드 추가
2024.12.15  임도헌   Modified  textarea 지원 추가
*/

/**
 * ForwardedRef 타입을 HTMLInputElement | HTMLTextAreaElement로 확장
 * textarea일 경우의 렌더링 로직 추가
 * ref 타입 캐스팅 추가
 * textarea의 기본 스타일 설정 (최소 높이, 수직 리사이즈 가능)
 * 공통 에러 메시지 스타일 유지
 */

import { ForwardedRef, forwardRef } from "react";

interface IInputProps
  extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
  label?: string;
  type?: string;
  required?: boolean;
  errors?: string[];
}

const _Input = (
  { errors = [], name, type = "text", className = "", ...rest }: IInputProps,
  ref: ForwardedRef<HTMLInputElement | HTMLTextAreaElement>
) => {
  if (type === "textarea") {
    return (
      <div className="flex flex-col gap-2">
        <textarea
          ref={ref as ForwardedRef<HTMLTextAreaElement>}
          name={name}
          className={`input-primary min-h-[200px] resize-y p-2 ${className}`}
          {...rest}
        />
        {errors.map((error, index) => (
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
    <div className="flex flex-col gap-2">
      <input
        ref={ref as ForwardedRef<HTMLInputElement>}
        type={type}
        name={name}
        className={`h-10 input-primary ${className}`}
        {...rest}
      />
      {errors.map((error, index) => (
        <span
          key={index}
          className="font-medium text-red-500 dark:text-red-400"
        >
          {error}
        </span>
      ))}
    </div>
  );
};

export default forwardRef(_Input);
