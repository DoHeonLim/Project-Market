/**
File Name : components/post/comment/CommentForm
Description : 댓글 폼
Author : 임도헌

History
Date        Author   Status    Description
2024.11.06  임도헌   Created
2024.11.06  임도헌   Modified  댓글 폼 추가
2024.11.06  임도헌   Modified  useOptimistic기능으로 댓글 추가 구현
2024.12.19  임도헌   Modified  댓글 폼 스타일 변경
2024.12.29  임도헌   Modified  댓글 input에 text색 변경
2025.05.08  임도헌   Modified  alert를 toast로 변경
2025.07.06  임도헌   Modified  낙관적 업데이트 삭제
*/
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  commentFormSchema,
  CommentFormValues,
} from "@/lib/post/form/commentFormSchema";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";
import { useState } from "react";
import { useComment } from "./CommentContext";

export default function CommentForm({ postId }: { postId: number }) {
  const { createComment } = useComment();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CommentFormValues>({
    resolver: zodResolver(commentFormSchema),
  });

  const submitHandler = handleSubmit(async (data: CommentFormValues) => {
    setIsLoading(true);
    const formData = new FormData();
    formData.append("payload", data.payload);
    formData.append("postId", postId.toString());
    await createComment(formData);
    reset();
    setIsLoading(false);
  });

  return (
    <form onSubmit={submitHandler} className="flex gap-2 mt-2">
      <input
        {...register("postId")}
        type="hidden"
        name="postId"
        defaultValue={postId}
      />
      <Input
        type="text"
        {...register("payload")}
        placeholder="항해 일지를 남겨보세요"
        errors={[errors.payload?.message ?? ""]}
        required
        className="flex-1 min-w-0 bg-white/10 border-neutral-600 text-black dark:text-white placeholder-neutral-400"
      />
      <Button text={isLoading ? "작성 중..." : "기록"} disabled={isLoading} />
    </form>
  );
}
