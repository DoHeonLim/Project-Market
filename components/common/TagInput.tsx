/**
File Name : components/common/TagInput.tsx
Description : 태그 입력 컴포넌트
Author : 임도헌

History
Date        Author   Status    Description
2024.12.18  임도헌   Created
2024.12.31  임도헌   Modified  태그 입력 컴포넌트 수정
2025.01.02  임도헌   Modified  defaultTags 예외처리 추가
2025.04.21  임도헌   Modified  useController 사용하는 방식으로 변경
*/
"use client";

import { XMarkIcon } from "@heroicons/react/24/solid";
import { useEffect, useState } from "react";
import { Control, useController } from "react-hook-form";

interface TagInputProps {
  name: string;
  control: Control<any>;
  maxTags?: number;
  resetSignal?: number; // 추가
}

export default function TagInput({
  name,
  control,
  maxTags = 5,
  resetSignal, // 받기
}: TagInputProps) {
  const {
    field: { value: tags = [], onChange },
    fieldState: { error },
  } = useController({ name, control });

  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    setTagInput(""); // resetSignal 변경되면 내부 인풋 초기화
  }, [resetSignal]);

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const newTag = tagInput.trim();
      if (newTag && !tags.includes(newTag) && tags.length < maxTags) {
        onChange([...tags, newTag]);
        setTagInput("");
      }
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const newTags = tags.filter((tag: string) => tag !== tagToRemove);
    onChange(newTags);
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium dark:text-white">
        태그 (최대 {maxTags}개, 쉼표 또는 엔터로 구분)
      </label>
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map((tag: string, index: number) => (
          <div
            key={index}
            className="flex items-center gap-1 px-2 py-1 bg-primary/10 rounded-full"
          >
            <span className="text-sm text-primary">#{tag}</span>
            <button
              type="button"
              onClick={() => handleRemoveTag(tag)}
              className="text-primary hover:text-primary-dark"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
      <input
        type="text"
        value={tagInput}
        onChange={(e) => setTagInput(e.target.value)}
        onKeyDown={handleAddTag}
        placeholder="태그를 입력하세요"
        className="p-2 border rounded-md dark:bg-neutral-800 dark:border-neutral-700"
        disabled={tags.length >= maxTags}
      />
      {error && <p className="text-sm text-red-500">{error.message}</p>}
    </div>
  );
}
