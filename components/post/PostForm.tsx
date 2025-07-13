/**
 * File Name : components/post/PostForm
 * Description : 게시글 작성/수정 공통 폼 (add + edit)
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2025.07.04  임도헌   Created   기존 add/page.tsx + PostEditForm 기능 통합
 */
"use client";

import Input from "@/components/common/Input";
import Button from "@/components/common/Button";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { useImageUpload } from "@/hooks/useImageUpload";
import ImageUploader from "@/components/image/ImageUploader";
import TagInput from "@/components/common/TagInput";
import { POST_CATEGORY } from "@/lib/constants";
import { getUploadUrl } from "@/lib/cloudflare/getUploadUrl";
import { useRouter } from "next/navigation";
import { postFormSchema, PostFormValues } from "@/lib/post/form/postFormSchema";

interface PostFormProps {
  initialValues?: PostFormValues & { id?: number };
  onSubmit: (
    formData: FormData
  ) => Promise<{ success: boolean; postId?: number; error?: string }>;
  backUrl: string;
  submitLabel?: string;
  isEdit?: boolean;
}

export default function PostForm({
  initialValues,
  onSubmit,
  backUrl,
  submitLabel = "작성 완료",
  isEdit = false,
}: PostFormProps) {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const [resetSignal, setResetSignal] = useState(0);

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
    getValues,
    reset,
  } = useForm<PostFormValues>({
    resolver: zodResolver(postFormSchema),
    defaultValues: initialValues || {
      title: "",
      description: "",
      category: "",
      photos: [],
      tags: [],
    },
  });

  const {
    previews,
    files,
    isImageFormOpen,
    setIsImageFormOpen,
    handleImageChange,
    handleDeleteImage,
    handleDragEnd,
    setPreviews,
    resetImage: resetImages,
  } = useImageUpload({ maxImages: 5, setValue, getValues });

  // 초기 이미지 설정 (수정 모드)
  useEffect(() => {
    if (isEdit && initialValues?.photos?.length) {
      setPreviews(initialValues.photos.map((url) => url + "/public"));
      setValue("photos", initialValues.photos);
    }
  }, [isEdit, initialValues?.photos, setValue, setPreviews]);

  const resetForm = () => {
    resetImages();
    reset();
    setResetSignal((prev) => prev + 1);
  };

  const submitHandler = handleSubmit(async (data: PostFormValues) => {
    setIsUploading(true);

    try {
      const newFiles = files.filter((file) => file instanceof File);
      const uploadedPhotoUrls: string[] = [];

      if (newFiles.length > 0) {
        const uploadPromises = newFiles.map(async (file) => {
          const { success, result } = await getUploadUrl();
          if (!success) throw new Error("Failed to get upload URL");

          const { uploadURL, id } = result;
          const cloudflareForm = new FormData();
          cloudflareForm.append("file", file);

          const response = await fetch(uploadURL, {
            method: "POST",
            body: cloudflareForm,
          });

          if (!response.ok) throw new Error("Failed to upload image");

          return `https://imagedelivery.net/3o3hwIVwLhMgAkoMCda2JQ/${id}`;
        });

        const urls = await Promise.all(uploadPromises);
        uploadedPhotoUrls.push(...urls);
      }

      // previews 배열 순서 유지하며 URL 처리
      const allPhotoUrls = previews
        .map((preview) => {
          if (preview.includes("imagedelivery.net")) {
            return preview.replace("/public", ""); // 기존 Cloudflare 이미지
          } else if (preview.startsWith("blob:")) {
            const index = previews
              .filter((p) => p.startsWith("blob:"))
              .indexOf(preview);
            return uploadedPhotoUrls[index] ?? ""; // 새로 업로드된 이미지 URL
          }
          return preview;
        })
        .filter(Boolean);

      const formData = new FormData();
      if (isEdit && initialValues?.id) {
        formData.append("id", initialValues.id.toString());
      }
      formData.append("title", data.title);
      formData.append("description", data.description);
      formData.append("category", data.category);
      data.tags?.forEach((tag) => formData.append("tags[]", tag));
      allPhotoUrls.forEach((url) => formData.append("photos[]", url));

      const result = await onSubmit(formData);

      if (result.success && result.postId) {
        router.push(`/posts/${result.postId}`);
      } else if (result.error) {
        alert(result.error);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("게시글 처리에 실패했습니다.");
    } finally {
      setIsUploading(false);
    }
  });

  return (
    <div>
      <form onSubmit={submitHandler} className="flex flex-col gap-5 p-5">
        <select
          {...register("category")}
          className="w-full p-2 rounded-md
          bg-neutral-200 text-neutral-800
          dark:bg-neutral-700 dark:text-white
          border border-neutral-300 dark:border-neutral-600
          focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
        >
          <option value="">카테고리 선택</option>
          {Object.entries(POST_CATEGORY).map(([key, value]) => (
            <option key={key} value={key}>
              {value}
            </option>
          ))}
        </select>
        {errors.category && (
          <p className="text-red-500">{errors.category.message}</p>
        )}

        <Input
          type="text"
          placeholder="제목"
          {...register("title")}
          errors={[errors.title?.message ?? ""]}
        />

        <Input
          type="textarea"
          placeholder="내용"
          {...register("description")}
          errors={[errors.description?.message ?? ""]}
          className="p-2 input-primary min-h-[200px] resize-y"
        />

        <TagInput
          name="tags"
          control={control}
          maxTags={5}
          resetSignal={resetSignal}
        />

        <ImageUploader
          previews={previews}
          onImageChange={handleImageChange}
          onDeleteImage={handleDeleteImage}
          onDragEnd={handleDragEnd}
          isOpen={isImageFormOpen}
          onToggle={() => setIsImageFormOpen(!isImageFormOpen)}
          isUploading={isUploading}
        />

        <Button
          text={
            isUploading ? (isEdit ? "수정 중..." : "업로드 중...") : submitLabel
          }
          disabled={isUploading}
        />

        <div className="flex gap-2 sm:text-sm md:text-md">
          <button
            type="reset"
            onClick={resetForm}
            className="flex-1 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors "
          >
            초기화
          </button>
          <Link
            href={backUrl}
            className="flex-1 py-2 bg-neutral-500 text-white rounded-md hover:bg-neutral-600 transition-colors text-center"
          >
            뒤로가기
          </Link>
        </div>
      </form>
    </div>
  );
}
