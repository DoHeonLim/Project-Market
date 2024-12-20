/**
File Name : components/button
Description : 폼 버튼 컴포넌트
Author : 임도헌

History
Date        Author   Status    Description
2024.10.01  임도헌   Created
2024.10.01  임도헌   Modified  button 컴포넌트 추가
2024.10.04  임도헌   Modified  useFormStatus 추가
*/
"use client";
import { useFormStatus } from "react-dom";

interface IButtonProps {
  text: string;
}

export default function Button({ text }: IButtonProps) {
  const { pending } = useFormStatus();
  return (
    <button
      disabled={pending}
      className="h-10 primary-btn disabled:bg-neutral-400 disabled:text-neutral-300 disabled:cursor-not-allowed"
    >
      {pending ? "로딩 중" : text}
    </button>
  );
}
