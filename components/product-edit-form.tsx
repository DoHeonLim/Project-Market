/**
File Name : components/edit-form
Description : 편집 폼 컴포넌트
Author : 임도헌

History
Date        Author   Status    Description
2024.11.02  임도헌   Created
2024.11.02  임도헌   Modified  편집 폼 컴포넌트 추가
2024.11.12  임도헌   Modified  제품 수정 클라우드 플레어로 리팩토링
2024.12.12  임도헌   Modified  useImageUpload 커스텀 훅으로 분리
2024.12.12  임도헌   Modified  제품 편집 폼 액션 코드 추가(여러 이미지 업로드)
2024.12.12  임도헌   Modified  폼 제출 후 모달에서 수정했는지 상세 페이지에서 수정했는지 확인 후 페이지 이동 로직 수정
*/
"use client";

import Button from "@/components/button";
import Input from "@/components/input";
import Link from "next/link";
import { useEffect } from "react";
import { editProduct } from "@/app/products/[id]/edit/actions";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  productEditSchema,
  ProductEditType,
} from "@/app/products/[id]/edit/schema";
import { useImageUpload } from "@/hooks/useImageUpload";
import ImageUploader from "@/components/image/image-uploader";
import { useRouter, usePathname } from "next/navigation";
import { getUploadUrl } from "@/app/add-product/action";

interface IEditFormProps {
  product: {
    id: number;
    title: string;
    images: { url: string; order: number }[];
    description: string;
    price: number;
  };
}

export default function EditForm({ product }: IEditFormProps) {
  const router = useRouter();
  const pathname = usePathname();
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    getValues,
  } = useForm<ProductEditType>({
    resolver: zodResolver(productEditSchema),
    defaultValues: {
      title: product.title,
      price: product.price,
      description: product.description,
      photos: product.images.map((image) => image.url),
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
    reset,
  } = useImageUpload({ maxImages: 5, setValue, getValues });

  // 초기 이미지 설정
  useEffect(() => {
    if (product.images.length > 0) {
      setPreviews(product.images.map((image) => image.url + "/public"));
      setValue(
        "photos",
        product.images.map((image) => image.url)
      );
    }
  }, [product.images, setValue, setPreviews]);

  const onSubmit = handleSubmit(async (data: ProductEditType) => {
    if (files.length === 0 && previews.length === 0) {
      alert("최소 1개 이상의 이미지를 업로드해주세요.");
      return;
    }

    const uploadedPhotoUrls: string[] = [];

    // 새로 추가된 파일들만 업로드
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

    // 기존 이미지 URL과 새로 업로드된 이미지 URL 합치기
    const allPhotoUrls = [
      ...getValues("photos").filter((url) => !url.includes("blob:")),
      ...uploadedPhotoUrls,
    ];

    const formData = new FormData();
    formData.append("id", product.id.toString());
    formData.append("title", data.title);
    formData.append("description", data.description);
    formData.append("price", data.price.toString());
    allPhotoUrls.forEach((url) => {
      formData.append("photos[]", url);
    });

    const result = await editProduct(formData);
    if (result?.success) {
      // 현재 경로가 모달인 경우와 아닌 경우를 구분하여 처리
      if (pathname.includes("products/[id]/edit")) {
        router.replace(`/products/${result.productId}`);
        //router.replace()를 사용하여 상세 페이지로 직접 이동
        //replace는 브라우저 히스토리를 덮어쓰므로 뒤로가기 시 이전 편집 페이지로 돌아가지 않음
      } else {
        router.back(); // 모달에서 편집한 경우 뒤로가기
        //router.back()을 사용하여 이전 페이지(모달을 열기 전 상태)로 돌아감
      }
      router.refresh(); // 데이터 갱신을 위해 페이지 새로고침
    } else if (result?.error) {
      alert(result.error);
    }
  });

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
          {previews.length === 0 && (
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
        <Button text="수정 완료" />
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
