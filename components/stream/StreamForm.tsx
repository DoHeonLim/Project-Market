/**
 * File Name : components/stream/StreamForm
 * Description : 스트리밍 생성/수정 폼 컴포넌트
 * Author : 임도헌
 *
 * History
 * Date        Author   Status     Description
 * 2025.07.30  임도헌   Created    app/streams/add/page에서 form 분리
 * 2025.07.30  임도헌   Modified   스트리밍 등록/수정 폼 통합 컴포넌트로 수정
 * 2025.08.22  임도헌   Modified   Cloudflare 업로드 표준화 응답 반영(유니온 내로잉), 이미지 URL 하드코딩 제거 및 env 사용(HASH)
 * 2025.08.22  임도헌   Modified   alert → toast로 변경, 에러 배열 전달 방식 정리
 * 2025.08.22  임도헌   Modified   visibility onChange를 register 옵션으로 이전
 * 2025.09.09  임도헌   Modified   Cloudflare Image URL에 variant(env) 추가, 소분류 초기화 resetField 적용, 타입/UX/a11y 보강
 * 2025.09.15  임도헌   Modified   LiveInput/Broadcast 모델 반영, 결과 모달 그대로 사용
 */
"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { useImageUpload } from "@/hooks/useImageUpload";
import {
  streamFormSchema,
  StreamFormValues,
} from "@/lib/stream/form/streamFormSchema";
import type { CreateBroadcastResult } from "@/types/stream";

import Input from "@/components/common/Input";
import Button from "@/components/common/Button";
import ImageUploader from "@/components/image/ImageUploader";
import Select from "@/components/common/Select";
import TagInput from "@/components/common/TagInput";

import { STREAM_VISIBILITY, STREAM_VISIBILITY_DISPLAY } from "@/lib/constants";
import { StreamCategory } from "@/generated/prisma/client";
import { getUploadUrl } from "@/lib/cloudflare/getUploadUrl";
import RTMPInfoModal from "./RTMPInfoModal";
import { toast } from "sonner";

interface StreamFormProps {
  mode: "create" | "edit";
  action: (formData: FormData) => Promise<CreateBroadcastResult>;
  categories: StreamCategory[];
  defaultValues?: Partial<StreamFormValues>;
}

const CF_HASH = process.env.NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_HASH;

export default function StreamForm({
  mode,
  action,
  categories,
  defaultValues,
}: StreamFormProps) {
  // 대분류 초기값: 기본 소분류(defaultValues.streamCategoryId)의 parentId를 역추적
  const initialMainCategory = useMemo<number | null>(() => {
    if (!defaultValues?.streamCategoryId) return null;
    return (
      categories.find((c) => c.id === defaultValues.streamCategoryId)
        ?.parentId ?? null
    );
  }, [categories, defaultValues?.streamCategoryId]);

  const [selectedMainCategory, setSelectedMainCategory] = useState<
    number | null
  >(initialMainCategory);

  const [streamInfo, setStreamInfo] = useState<{
    liveInputId: number;
    broadcastId?: number | null;
    streamKey: string;
    rtmpUrl: string;
  } | null>(null);
  const [showStreamInfo, setShowStreamInfo] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    resetField,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<StreamFormValues>({
    resolver: zodResolver(streamFormSchema),
    defaultValues: {
      title: "",
      description: "",
      thumbnail: "",
      visibility: STREAM_VISIBILITY.PUBLIC,
      password: "",
      streamCategoryId: undefined as unknown as number,
      tags: [],
      ...defaultValues,
    },
  });

  const watchVisibility = watch("visibility");

  // PRIVATE가 아니면 password 초기화
  useEffect(() => {
    if (watchVisibility !== STREAM_VISIBILITY.PRIVATE) {
      setValue("password", "");
    }
  }, [watchVisibility, setValue]);

  // 이미지 업로드 훅 (1장만)
  const {
    previews,
    files,
    isImageFormOpen,
    setIsImageFormOpen,
    handleImageChange,
    handleDeleteImage,
    handleDragEnd,
  } = useImageUpload({ maxImages: 1, setValue, getValues });

  // 대/소분류 옵션
  const mainCategories = useMemo(
    () => categories.filter((c) => !c.parentId),
    [categories]
  );
  const subCategories = useMemo(
    () => categories.filter((c) => c.parentId === selectedMainCategory),
    [categories, selectedMainCategory]
  );

  const handleMainCategoryChange = (value: string) => {
    const id = value ? Number(value) : null;
    setSelectedMainCategory(id);
    resetField("streamCategoryId");
  };

  const onSubmit = async (data: StreamFormValues) => {
    try {
      // 1) 썸네일 업로드(선택)
      let thumbnail = data.thumbnail;

      if (files.length > 0) {
        if (!CF_HASH) {
          throw new Error(
            "Cloudflare 공개 해시(NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_HASH)가 설정되지 않았습니다."
          );
        }
        const res = await getUploadUrl();
        if (!res.success) {
          throw new Error(res.error ?? "Failed to get upload URL");
        }

        const uploadBody = new FormData();
        uploadBody.append("file", files[0]);

        const uploadResp = await fetch(res.result.uploadURL, {
          method: "POST",
          body: uploadBody,
        });
        if (!uploadResp.ok) throw new Error("이미지 업로드 실패");

        thumbnail = `https://imagedelivery.net/${CF_HASH}/${res.result.id}`;
      }

      // 2) 서버 액션 호출
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("description", data.description ?? "");
      formData.append("thumbnail", thumbnail ?? "");
      formData.append("visibility", data.visibility);
      formData.append("password", data.password ?? "");
      if (typeof data.streamCategoryId === "number") {
        formData.append("streamCategoryId", String(data.streamCategoryId));
      } else {
        formData.append("streamCategoryId", "");
      }
      formData.append("tags", JSON.stringify((data.tags ?? []).slice(0, 5)));

      const result = await action(formData);

      if (!result.success) {
        toast.error(result.error ?? "스트리밍 처리 중 오류가 발생했습니다.");
        return;
      }

      // 새 응답 필드에 맞춰 저장
      setStreamInfo({
        liveInputId: result.liveInputId!, // 필수
        broadcastId: result.broadcastId ?? null, // 선택
        streamKey: result.streamKey!, // 필수
        rtmpUrl: result.rtmpUrl!, // 필수
      });
      setShowStreamInfo(true);

      toast.success(
        // create/edit 공통 문구여도 무방. 필요시 mode별 문구 분기
        "스트리밍이 생성되었습니다."
      );
    } catch (error) {
      console.error("[StreamForm] submit failed:", error);
      toast.error("스트리밍 처리 중 오류가 발생했습니다.");
    }
  };

  return (
    <>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6"
        aria-live="polite"
      >
        {/* 제목 */}
        <Input
          placeholder="스트리밍 제목을 입력하세요 (5자 이상)"
          errors={errors.title?.message ? [errors.title.message] : []}
          {...register("title")}
        />

        {/* 설명 */}
        <Input
          type="textarea"
          placeholder="스트리밍 설명을 입력하세요"
          errors={
            errors.description?.message ? [errors.description.message] : []
          }
          {...register("description")}
        />

        {/* 썸네일 업로더 */}
        <div className="space-y-2">
          <label className="block font-medium text-black dark:text-white">
            썸네일
          </label>
          <ImageUploader
            previews={previews}
            onImageChange={handleImageChange}
            onDeleteImage={handleDeleteImage}
            onDragEnd={handleDragEnd}
            isOpen={isImageFormOpen}
            onToggle={() => setIsImageFormOpen(!isImageFormOpen)}
            maxImages={1}
            optional
          />
        </div>

        {/* 카테고리 (대/소분류) */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* 대분류 */}
          <Select
            label="대분류"
            value={selectedMainCategory?.toString() || ""}
            onChange={(e) => handleMainCategoryChange(e.target.value)}
            errors={
              errors.streamCategoryId?.message
                ? [errors.streamCategoryId.message]
                : []
            }
          >
            <option value="">대분류 선택</option>
            {mainCategories.map((c) => (
              <option key={c.id} value={String(c.id)}>
                {c.icon} {c.kor_name}
              </option>
            ))}
          </Select>

          {/* 소분류 */}
          <Select
            label="소분류"
            {...register("streamCategoryId")}
            disabled={!selectedMainCategory}
            errors={
              errors.streamCategoryId?.message
                ? [errors.streamCategoryId.message]
                : []
            }
          >
            <option value="">소분류 선택</option>
            {subCategories.map((c) => (
              <option key={c.id} value={String(c.id)}>
                {c.icon} {c.kor_name}
              </option>
            ))}
          </Select>
        </div>

        {/* 태그 */}
        <TagInput name="tags" control={control} maxTags={5} />

        {/* 공개 설정 + 비밀번호 */}
        <div className="space-y-2">
          <label className="block font-medium text-black dark:text-white">
            공개 설정
          </label>
          <div className="grid grid-cols-2 gap-4">
            <Select
              {...register("visibility", {
                onChange: (e) =>
                  setValue(
                    "visibility",
                    e.target.value as StreamFormValues["visibility"]
                  ),
              })}
            >
              <option value={STREAM_VISIBILITY.PUBLIC}>
                {STREAM_VISIBILITY_DISPLAY.PUBLIC}
              </option>
              <option value={STREAM_VISIBILITY.PRIVATE}>
                {STREAM_VISIBILITY_DISPLAY.PRIVATE}
              </option>
              <option value={STREAM_VISIBILITY.FOLLOWERS}>
                {STREAM_VISIBILITY_DISPLAY.FOLLOWERS}
              </option>
            </Select>

            {watchVisibility === STREAM_VISIBILITY.PRIVATE && (
              <Input
                type="password"
                placeholder="비밀번호를 입력하세요"
                {...register("password")}
                errors={
                  errors.password?.message ? [errors.password.message] : []
                }
                aria-label="비공개 스트리밍 비밀번호"
              />
            )}
          </div>
        </div>

        {/* 제출 버튼 */}
        <Button
          disabled={isSubmitting}
          text={mode === "create" ? "스트리밍 시작" : "스트리밍 수정"}
          aria-busy={isSubmitting || undefined}
        />
      </form>

      {/* RTMP/스트림 키 안내 모달 */}
      {showStreamInfo && streamInfo && (
        <RTMPInfoModal
          open={showStreamInfo}
          onOpenChange={setShowStreamInfo}
          rtmpUrl={streamInfo.rtmpUrl}
          streamKey={streamInfo.streamKey}
          liveInputId={streamInfo.liveInputId}
          broadcastId={streamInfo.broadcastId ?? undefined}
        />
      )}
    </>
  );
}
