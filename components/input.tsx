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
*/

import { ForwardedRef, forwardRef, InputHTMLAttributes } from "react";

interface IInputProps {
  errors?: string[];
  name: string;
}

const _Input = (
  {
    errors = [],
    name,
    ...rest
  }: IInputProps & InputHTMLAttributes<HTMLInputElement>,
  ref: ForwardedRef<HTMLInputElement>
) => {
  return (
    <div className="flex flex-col gap-2">
      <input
        ref={ref}
        name={name}
        className="w-full h-10 transition bg-transparent border-none rounded-md focus:outline-none ring-2 focus:ring-4 ring-neutral-200 focus:ring-indigo-500 placeholder:text-neutral-400"
        {...rest}
      />
      {errors.map((error, index) => (
        <span key={index} className="font-medium text-red-500">
          {error}
        </span>
      ))}
    </div>
  );
};

export default forwardRef(_Input);
