/**
File Name : components/tag-input.tsx
Description : 태그 입력 컴포넌트
Author : 임도헌

History
Date        Author   Status    Description
2024.12.18  임도헌   Created
*/
"use client";

import { XMarkIcon } from "@heroicons/react/24/solid";
import { useState } from "react";

interface TagInputProps {
  onTagsChange: (tags: string[]) => void;
  errors?: string[];
  maxTags?: number;
}

export default function TagInput({
  onTagsChange,
  errors = [],
  maxTags = 5,
}: TagInputProps) {
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const newTag = tagInput.trim();
      if (newTag && !tags.includes(newTag) && tags.length < maxTags) {
        const newTags = [...tags, newTag];
        setTags(newTags);
        onTagsChange(newTags);
        setTagInput("");
      }
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const newTags = tags.filter((tag) => tag !== tagToRemove);
    setTags(newTags);
    onTagsChange(newTags);
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium dark:text-white">
        태그 (최대 {maxTags}개, 쉼표 또는 엔터로 구분)
      </label>
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map((tag, index) => (
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
      {errors.map(
        (error, index) =>
          error && (
            <p key={index} className="text-sm text-red-500">
              {error}
            </p>
          )
      )}
    </div>
  );
}
