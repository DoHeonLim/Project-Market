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
import { redirect } from "next/navigation";
import { useImageUpload } from "@/hooks/useImageUpload";
import ImageUploader from "@/components/image/image-uploader";

export default function AddPost() {
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
    if (files.length === 0) return;

    setIsUploading(true); // 업로드 시작

    const uploadedPhotoUrls: string[] = [];

    // 이미지 업로드를 병렬로 처리
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

    // 모든 이미지 업로드를 동시에 처리
    const urls = await Promise.all(uploadPromises);
    uploadedPhotoUrls.push(...urls);

    // 폼 데이터 생성 및 제출
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("description", data.description);
    uploadedPhotoUrls.forEach((url) => {
      formData.append("photos[]", url);
    });

    // uploadPost를 리턴
    return uploadPost(formData);
  });

  const onValid = async () => {
    await onSubmit();
    redirect("/life");
  };

  return (
    <div>
      <h1 className="pl-5 pt-5 font-semibold text-center">게시글 작성하기</h1>
      <form action={onValid} className="flex flex-col gap-5 p-5">
        <Input
          type="text"
          required
          placeholder="제목"
          {...register("title")}
          errors={[errors.title?.message ?? ""]}
        />
        <Input
          type="text"
          required
          placeholder="설명"
          {...register("description")}
          errors={[errors.description?.message ?? ""]}
        />
        {/* 이미지 업로드 드롭다운 영역 */}
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
            className="flex items-center justify-center flex-1 h-10 font-semibold text-white transition-colors bg-indigo-300 rounded-md px-auto hover:bg-indigo-400"
          >
            초기화
          </button>
          <Link
            className="flex items-center justify-center flex-1 h-10 font-semibold text-white transition-colors bg-indigo-300 rounded-md px-auto hover:bg-indigo-400"
            href="/products"
          >
            뒤로가기
          </Link>
        </div>
      </form>
    </div>
  );
}
