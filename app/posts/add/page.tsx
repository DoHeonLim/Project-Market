/**
File Name : app/posts/add/page
Description : 동네생활 게시글 생성 페이지
Author : 임도헌

History
Date        Author   Status    Description
2024.11.23  임도헌   Created
2024.11.23  임도헌   Modified  동네생활 게시글 생성 페이지 추가
2024.12.10  임도헌   Modified  게시글에 이미지 업로드 추가(이미지 여러개)
2024.12.10  임도헌   Modified  이미지 업로드 로딩 상태 추가
2024.12.18  임도헌   Modified  항해일지 추가 페이지로 변경(동네생활 -> 항해일지)
*/
"use client";

// import dynamic from "next/dynamic";
import Input from "@/components/input";
import Button from "@/components/button";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { postSchema, PostType } from "./schema";
import { uploadPost } from "./actions";
import { useState } from "react";
import { getUploadUrl } from "@/app/add-product/action";
import { useRouter } from "next/navigation";
import { useImageUpload } from "@/hooks/useImageUpload";
import ImageUploader from "@/components/image/image-uploader";
import TagInput from "@/components/tag-input";
import { POST_CATEGORY } from "@/lib/constants";

export default function AddPost() {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false); // 로딩 상태 추가
  // RHF 사용
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    getValues,
  } = useForm<PostType>({
    resolver: zodResolver(postSchema),
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
    reset,
  } = useImageUpload({ maxImages: 5, setValue, getValues });

  const onSubmit = handleSubmit(async (data: PostType) => {
    setIsUploading(true); // 업로드 시작

    try {
      const uploadedPhotoUrls: string[] = [];

      // 이미지가 있는 경우에만 업로드 처리
      if (files.length > 0) {
        const uploadPromises = files.map(async (file) => {
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

      // 폼 데이터 생성
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("description", data.description);
      formData.append("category", data.category);
      data.tags?.forEach((tag) => formData.append("tags[]", tag));
      uploadedPhotoUrls.forEach((url) => formData.append("photos[]", url));

      const result = await uploadPost(formData);

      if (result?.success && result.postId) {
        router.push(`/posts/${result.postId}`);
      } else if (result?.error) {
        alert(result.error);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("게시글 작성에 실패했습니다.");
    } finally {
      setIsUploading(false);
    }
  });

  return (
    <div>
      <h1 className="pl-5 pt-5 font-semibold text-center">게시글 작성하기</h1>
      <form onSubmit={onSubmit} className="flex flex-col gap-5 p-5">
        {/* 카테고리 선택 */}
        <select
          {...register("category")}
          className="w-full p-2 bg-neutral-800 rounded-md"
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
          onTagsChange={(tags) => setValue("tags", tags)}
          errors={[errors.tags?.message ?? ""]}
          maxTags={5}
        />

        {/* 이미지 업로드 */}
        <ImageUploader
          previews={previews}
          onImageChange={handleImageChange}
          onDeleteImage={handleDeleteImage}
          onDragEnd={handleDragEnd}
          isOpen={isImageFormOpen}
          onToggle={() => setIsImageFormOpen(!isImageFormOpen)}
        />

        <Button
          text={isUploading ? "업로드 중..." : "작성 완료"}
          disabled={isUploading}
        />

        <div className="flex gap-2">
          <button
            type="reset"
            onClick={reset}
            className="flex-1 h-10 font-semibold text-white transition-colors bg-indigo-300 rounded-md hover:bg-indigo-400"
          >
            초기화
          </button>
          <Link
            href="/posts"
            className="flex-1 h-10 font-semibold text-white transition-colors bg-indigo-300 rounded-md hover:bg-indigo-400 flex items-center justify-center"
          >
            뒤로가기
          </Link>
        </div>
      </form>
    </div>
  );
}
