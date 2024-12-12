/**
File Name : app/add-product/page
Description : 제품 업로드 페이지
Author : 임도헌

History
Date        Author   Status    Description
2024.10.17  임도헌   Created
2024.10.17  임도헌   Modified  제품 업로드 페이지 추가
2024.10.19  임도헌   Modified  폼 에러 추가
2024.11.11  임도헌   Modified  클라우드 플레어 이미지 연결
2024.11.11  임도헌   Modified  react hook form을 사용하는 코드로 변경
2024.12.12  임도헌   Modified  products/add 에서 add-product로 이동

*/
"use client";

import Button from "@/components/button";
import Input from "@/components/input";
import Link from "next/link";
import { useState } from "react";
import { getUploadUrl, uploadProduct } from "./action";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productSchema, ProductType } from "./schema";
import { useImageUpload } from "@/hooks/useImageUpload";
import ImageUploader from "@/components/image/image-uploader";
import { useRouter } from "next/navigation";

export default function AddProduct() {
  const router = useRouter();
  // 업로드 상태
  const [isUploading, setIsUploading] = useState(false);

  // react hook form 설정
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    getValues,
  } = useForm<ProductType>({
    resolver: zodResolver(productSchema),
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

  // 제품 업로드 함수
  const onSubmit = handleSubmit(async (data: ProductType) => {
    if (files.length === 0) {
      alert("최소 1개 이상의 이미지를 업로드해주세요.");
      return;
    }

    setIsUploading(true);

    const uploadedPhotoUrls: string[] = [];

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

    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("description", data.description);
    formData.append("price", data.price.toString());
    uploadedPhotoUrls.forEach((url) => {
      formData.append("photos[]", url);
    });

    const result = await uploadProduct(formData);
    if (result?.success) {
      router.replace(`/products/${result.productId}`);
    } else if (result?.error) {
      alert(result.error);
    }
  });

  // 제품 업로드 함수
  const onValid = async () => {
    await onSubmit();
  };

  return (
    <div>
      <form action={onValid} className="flex flex-col gap-5 p-5">
        <div className="flex flex-col gap-1">
          <ImageUploader
            previews={previews}
            onImageChange={handleImageChange}
            onDeleteImage={handleDeleteImage}
            onDragEnd={handleDragEnd}
            isOpen={isImageFormOpen}
            onToggle={() => setIsImageFormOpen(!isImageFormOpen)}
            optional={false}
          />
          {files.length === 0 && (
            <p className="text-sm text-red-500 px-2">
              최소 1개 이상의 이미지를 업로드해주세요.
            </p>
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
          type="number"
          required
          placeholder="가격"
          {...register("price")}
          errors={[errors.price?.message ?? ""]}
        />
        <Input
          type="text"
          required
          placeholder="설명"
          {...register("description")}
          errors={[errors.description?.message ?? ""]}
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
            className="flex-1 h-10 font-semibold text-white transition-colors bg-indigo-300 rounded-md flex items-center justify-center hover:bg-indigo-400"
            href="/products"
          >
            뒤로가기
          </Link>
        </div>
      </form>
    </div>
  );
}
