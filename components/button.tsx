/**
File Name : components/button
Description : 폼 버튼 컴포넌트
Author : 임도헌

History
Date        Author   Status    Description
2024.10.01  임도헌   Created
2024.10.01  임도헌   Modified  button 컴포넌트 추가
2024.10.04  임도헌   Modified  useFormStatus 추가
2024.12.10  임도헌   Modified  disabled 추가
*/
"use client";
import { useFormStatus } from "react-dom";

interface IButtonProps {
  text: string;
  disabled?: boolean;
}

export default function Button({ text, disabled }: IButtonProps) {
  const { pending } = useFormStatus();

  const isDisabled = pending || disabled;

  return (
    <button disabled={isDisabled} className="h-10 font-semibold btn-primary">
      {pending ? "로딩 중" : text}
    </button>
  );
}
