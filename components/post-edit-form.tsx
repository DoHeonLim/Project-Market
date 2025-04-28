/**
File Name : components/post-edit-form
Description : 게시글 편집 폼 컴포넌트
Author : 임도헌

History
Date        Author   Status    Description
2025.04.21  임도헌   Created
2025.04.21  임도헌   Modified   게시글 편집 컴포넌트 추가
2025.04.28  임도헌   Modified   
*/
"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useImageUpload } from "@/hooks/useImageUpload";
import { getUploadUrl } from "@/app/add-product/action";
import { POST_CATEGORY } from "@/lib/constants";
import Input from "@/components/input";
import TagInput from "@/components/tag-input";
import ImageUploader from "@/components/image/image-uploader";
import Button from "@/components/button";
import Link from "next/link";
import { PostType } from "@/app/posts/add/schema";
import { postEditSchema, PostEditType } from "@/app/posts/[id]/edit/schema";
import { editPost } from "@/app/posts/[id]/edit/actions";

interface IPostEditFormProps {
  post: {
    id: number;
    title: string;
    description: string | null;
    category: string;
    images: { url: string; order: number }[];
    tags: { name: string }[];
  };
}

export default function PostEditForm({ post }: IPostEditFormProps) {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false); // 로딩 상태 추가
  const [resetSignal, setResetSignal] = useState(0);
  // RHF 사용
  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
    getValues,
    reset,
  } = useForm<PostEditType>({
    resolver: zodResolver(postEditSchema),
    defaultValues: {
      id: post.id,
      title: post.title,
      description: post.description!,
      category: post.category,
      tags: post.tags.map((tag) => tag.name),
      photos: post.images.map((image) => image.url),
    },
  });
  // 이미지 업로드 커스텀 훅
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


  // 초기 이미지 설정
  useEffect(() => {
    if (post.images.length > 0) {
      setPreviews(post.images.map((image) => image.url + "/public"));
      setValue(
        "photos",
        post.images.map((image) => image.url)
      );
    }
  }, [post.images, setValue, setPreviews]);

  const resetForm = () => {
    // 이미지 리셋
    resetImages();
    // 폼 초기화
    reset({
      id: post.id,
      title: "",
      description: "",
      category: "",
      photos: [],
      tags: [],
    });
    setResetSignal((prev) => prev + 1); // resetSignal 트리거
  };

  const onSubmit = handleSubmit(async (data: PostType) => {
    setIsUploading(true); // 업로드 시작

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

      // previews 배열의 순서를 유지하면서 URL 처리
      const allPhotoUrls = previews.map((preview) => {
        if (preview.includes("imagedelivery.net")) {
          // 기존 Cloudflare 이미지
          return preview.replace("/public", "");
        } else if (preview.startsWith("blob:")) {
          // 새로 업로드된 이미지의 경우
          const index = previews
            .filter((p) => p.startsWith("blob:"))
            .indexOf(preview);
          return uploadedPhotoUrls[index];
        }
        return preview;
      });

      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (key === "tags") {
          formData.append(key, JSON.stringify(value));
        } else if (key !== "photos") {
          formData.append(key, value.toString());
        }
      });

      allPhotoUrls.forEach((url) => {
        formData.append("photos[]", url);
      });

      const result = await editPost(formData);
      if (result?.success) {
        toast.success('게시글이 성공적으로 수정되었습니다.');
        router.replace(`/posts/${result.postId}`);
      } else if (result?.error) {
        toast.error(result.error);
      }
    } catch (error) {
      console.error("게시글 수정 중 오류 발생:", error);
      alert("게시글 수정 중 오류가 발생했습니다.");
    } finally {
      setIsUploading(false);
    }
  });

  return (
    <div>
      <form onSubmit={onSubmit} className="flex flex-col gap-5 p-5">
        {/* 카테고리 선택 */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-neutral-200">
            게시글 카테고리
          </label>
          <select
            {...register("category")}
            className="w-full p-2 bg-neutral-800 rounded-md border border-neutral-700 focus:border-primary focus:ring-1 focus:ring-primary"
          >
            <option value="" disabled>
              카테고리를 선택해주세요
            </option>
            {Object.entries(POST_CATEGORY).map(([key, value]) => (
              <option key={key} value={key}>
                {value}
              </option>
            ))}
          </select>
          {errors.category && (
            <p className="text-red-500 text-sm">{errors.category.message}</p>
          )}
        </div>

        <Input
          type="text"
          required
          placeholder="제목"
          {...register("title")}
          errors={[errors.title?.message ?? ""]}
        />

        <Input
          type="textarea"
          required
          placeholder="내용"
          {...register("description")}
          errors={[errors.description?.message ?? ""]}
          className="p-2 input-primary min-h-[200px] resize-y"
        />

        {/* 태그 입력 */}
        <TagInput
          name="tags"
          control={control}
          maxTags={5}
          resetSignal={resetSignal}
        />

        <div className="flex flex-col gap-1">
          <ImageUploader
            previews={previews}
            onImageChange={handleImageChange}
            onDeleteImage={handleDeleteImage}
            onDragEnd={handleDragEnd}
            isOpen={isImageFormOpen}
            onToggle={() => setIsImageFormOpen(!isImageFormOpen)}
            isUploading={isUploading}
          />
        </div>

        <Button
          text={isUploading ? "수정 중..." : "수정하기"}
          disabled={isUploading}
        />

        <div className="flex gap-2">
          <button
            type="button"
            onClick={resetForm}
            className="flex-1 h-10 font-semibold text-white transition-colors bg-red-500 rounded-md hover:bg-red-600"
          >
            초기화
          </button>
          <Link
            className="flex-1 h-10 font-semibold text-white transition-colors bg-neutral-500 rounded-md flex items-center justify-center hover:bg-neutral-600"
            href={`/posts/${post.id}`}
          >
            취소
          </Link>
        </div>
      </form>
    </div>
  );
}
