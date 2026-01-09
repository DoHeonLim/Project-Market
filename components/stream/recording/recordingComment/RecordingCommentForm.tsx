/**
 * File Name : components/stream/recordingComment/RecordingCommentForm
 * Description : 녹화본 댓글 작성 폼 컴포넌트 (VodAsset 단위)
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2025.08.04  임도헌   Created   녹화본 댓글 폼 리팩토링 (react-hook-form + zod 적용)
 * 2025.09.10  임도헌   Modified  streamId hidden 필드 제거(타입 미스 방지), 로딩 토글 보장, 입력 trim
 * 2025.09.20  임도헌   Modified  VodAsset 전환(streamId → vodId), RHF defaultValues 정합성 유지
 */

"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  streamCommentFormSchema,
  StreamCommentFormValues,
} from "@/lib/stream/form/streamCommentFormSchema";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";
import { useState } from "react";
import { useRecordingCommentContext } from "@/components/stream/recording/recordingComment/RecordingCommentContext";

export default function RecordingCommentForm({ vodId }: { vodId: number }) {
  const { createComment } = useRecordingCommentContext();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<StreamCommentFormValues>({
    resolver: zodResolver(streamCommentFormSchema),
    defaultValues: {
      vodId, // RHF 내부 값으로 유지(별도 hidden input 불필요)
      payload: "",
    },
  });

  const submitHandler = handleSubmit(async (data) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("payload", data.payload.trim()); // 공백 제거
      formData.append("vodId", String(vodId)); // 서버 액션에 명시 전달
      await createComment(formData);
      reset({ vodId, payload: "" });
    } finally {
      setIsLoading(false);
    }
  });

  return (
    <form onSubmit={submitHandler} className="flex gap-2 mt-6">
      <Input
        type="text"
        {...register("payload")}
        placeholder="댓글을 입력하세요..."
        errors={[errors.payload?.message ?? ""]}
        className="flex-1 min-w-0 bg-white/10 border-neutral-600 text-black dark:text-white placeholder-neutral-400"
      />
      <Button text={isLoading ? "작성 중..." : "등록"} disabled={isLoading} />
    </form>
  );
}
