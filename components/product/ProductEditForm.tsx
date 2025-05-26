/**
File Name : components/product/ProductEditForm
Description : 제품 편집 폼 컴포넌트
Author : 임도헌

History
Date        Author   Status    Description
2024.11.02  임도헌   Created
2024.11.02  임도헌   Modified  편집 폼 컴포넌트 추가
2024.11.12  임도헌   Modified  제품 수정 클라우드 플레어로 리팩토링
2024.12.12  임도헌   Modified  useImageUpload 커스텀 훅으로 분리
2024.12.12  임도헌   Modified  제품 편집 폼 액션 코드 추가(여러 이미지 업로드)
2024.12.12  임도헌   Modified  폼 제출 후 모달에서 수정했는지 상세 페이지에서 수정했는지 확인 후 페이지 이동 로직 수정
2024.12.29  임도헌   Modified  보트포트 형식에 맞게 제품 수정 폼 변경
2025.04.13  임도헌   Modified  completeness 필드를 영어로 변경
2025.04.13  임도헌   Modified  condition 필드를 영어로 변경
2025.04.13  임도헌   Modified  game_type 필드를 영어로 변경
*/
"use client";

import Link from "next/link";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import Select from "../common/Select";
import TagInput from "../common/TagInput";
import { useEffect, useState } from "react";
import { editProduct } from "@/app/products/[id]/edit/actions";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  productEditSchema,
  ProductEditType,
} from "@/app/products/[id]/edit/schema";
import { useImageUpload } from "@/hooks/useImageUpload";
import ImageUploader from "@/components/image/ImageUploader";
import { useRouter, usePathname } from "next/navigation";
import { getUploadUrl } from "@/app/add-product/action";
import { Category } from "@prisma/client";
import {
  COMPLETENESS_DISPLAY,
  COMPLETENESS_TYPES,
  CONDITION_DISPLAY,
  CONDITION_TYPES,
  GAME_TYPE_DISPLAY,
  GAME_TYPES,
} from "@/lib/constants";

interface IEditFormProps {
  product: {
    id: number;
    title: string;
    images: { url: string; order: number }[];
    description: string;
    price: number;
    game_type: "BOARD_GAME" | "TRPG" | "CARD_GAME";
    min_players: number;
    max_players: number;
    play_time: string;
    condition: "NEW" | "LIKE_NEW" | "GOOD" | "USED";
    completeness: "PERFECT" | "USED" | "REPLACEMENT" | "INCOMPLETE";
    has_manual: boolean;
    categoryId: number;
    search_tags: { name: string }[];
  };
  categories: Category[];
}

export default function ProductEditForm({
  product,
  categories,
}: IEditFormProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [selectedMainCategory, setSelectedMainCategory] = useState<
    number | null
  >(null);
  const [isUploading, setIsUploading] = useState(false);
  const [resetSignal, setResetSignal] = useState(0);

  const {
    register,
    handleSubmit,
    setValue,
    control,
    watch,
    formState: { errors },
    getValues,
    reset,
  } = useForm<ProductEditType>({
    resolver: zodResolver(productEditSchema),
    defaultValues: {
      id: product.id,
      title: product.title,
      price: product.price,
      description: product.description,
      photos: product.images.map((image) => image.url),
      game_type: product.game_type,
      min_players: product.min_players,
      max_players: product.max_players,
      play_time: product.play_time,
      condition: product.condition,
      completeness: product.completeness,
      has_manual: product.has_manual,
      categoryId: product.categoryId,
      tags: product.search_tags.map((tag) => tag.name),
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

  // 최소 인원이 최대 인원보다 크지 않도록 감시
  const minPlayers = watch("min_players");
  const maxPlayers = watch("max_players");

  if (minPlayers > maxPlayers) {
    setValue("max_players", minPlayers);
  }

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

  // 초기 카테고리 설정
  useEffect(() => {
    const currentCategory = categories.find(
      (cat) => cat.id === product.categoryId
    );
    if (currentCategory?.parentId) {
      setSelectedMainCategory(currentCategory.parentId);
      setValue("categoryId", product.categoryId);
    }
  }, [categories, product.categoryId, setValue]);

  // 카테고리 선택값 감시
  const selectedCategoryId = watch("categoryId");

  // 모든 폼 필드를 리셋하는 함수 추가
  const resetForm = () => {
    // 이미지 리셋
    resetImages();

    // 폼 초기화 - 모든 필드를 초기값으로 리셋
    reset({
      id: product.id,
      title: "",
      price: NaN,
      description: "",
      photos: [],
      game_type: "BOARD_GAME",
      min_players: 1,
      max_players: 4,
      play_time: "30분",
      condition: "NEW",
      completeness: "PERFECT",
      has_manual: true,
      categoryId: 0,
      tags: [],
    });

    // 카테고리 선택 상태도 리셋
    setSelectedMainCategory(null);
    setResetSignal((prev) => prev + 1); // resetSignal 트리거
  };

  const onSubmit = handleSubmit(async (data: ProductEditType) => {
    if (files.length === 0 && previews.length === 0) {
      alert("최소 1개 이상의 이미지를 업로드해주세요.");
      return;
    }

    setIsUploading(true);

    try {
      // 새로 추가된 파일 업로드
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
      formData.append("id", product.id.toString());
      Object.entries(data).forEach(([key, value]) => {
        if (key === "tags") {
          formData.append(key, JSON.stringify(value));
        } else if (key !== "photos") {
          formData.append(key, value.toString());
        }
      });

      // 순서가 유지된 URL 배열을 FormData에 추가
      allPhotoUrls.forEach((url) => {
        formData.append("photos[]", url);
      });

      const result = await editProduct(formData);
      if (result?.success) {
        if (pathname.includes("products/[id]/edit")) {
          router.replace(`/products/${result.productId}`);
          //router.replace()를 사용하여 상세 페이지로 직접 이동
          //replace는 브라우저 히스토리를 덮어쓰므로 뒤로가기 시 이전 편집 페이지로 돌아가지 않음
        } else {
          router.back(); // 모달에서 편집한 경우 뒤로가기
          //router.back()을 사용하여 이전 페이지(모달을 열기 전 상태)로 돌아감
        }
        router.refresh();
      } else if (result?.error) {
        alert(result.error);
      }
    } catch (error) {
      console.error("에러 발생:", error);
      alert("제품 수정 중 오류가 발생했습니다.");
    } finally {
      setIsUploading(false);
    }
  });

  return (
    <div>
      <form onSubmit={onSubmit} className="flex flex-col gap-5 p-5">
        <div className="flex flex-col gap-1">
          <ImageUploader
            previews={previews}
            onImageChange={handleImageChange}
            onDeleteImage={handleDeleteImage}
            onDragEnd={handleDragEnd}
            isOpen={isImageFormOpen}
            onToggle={() => setIsImageFormOpen(!isImageFormOpen)}
            isUploading={isUploading}
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
          placeholder="제품명을 입력해주세요"
          {...register("title")}
          errors={[errors.title?.message ?? ""]}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            {...register("game_type")}
            errors={[errors.game_type?.message ?? ""]}
          >
            {GAME_TYPES.map((type) => (
              <option key={type} value={type}>
                {GAME_TYPE_DISPLAY[type]}
              </option>
            ))}
          </Select>

          <Input
            type="number"
            required
            placeholder="가격을 입력해주세요"
            {...register("price")}
            errors={[errors.price?.message ?? ""]}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            type="number"
            required
            min={1}
            {...register("min_players")}
            errors={[errors.min_players?.message ?? ""]}
          />
          <Input
            type="number"
            required
            min={minPlayers}
            {...register("max_players")}
            errors={[errors.max_players?.message ?? ""]}
          />
          <Input
            type="text"
            required
            placeholder="ex) 30-60분"
            {...register("play_time")}
            errors={[errors.play_time?.message ?? ""]}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="제품 상태"
            {...register("condition")}
            errors={[errors.condition?.message ?? ""]}
          >
            {CONDITION_TYPES.map((type) => (
              <option key={type} value={type}>
                {CONDITION_DISPLAY[type]}
              </option>
            ))}
          </Select>

          <Select
            label="구성품 상태"
            {...register("completeness")}
            errors={[errors.completeness?.message ?? ""]}
          >
            {COMPLETENESS_TYPES.map((type) => (
              <option key={type} value={type}>
                {COMPLETENESS_DISPLAY[type]}
              </option>
            ))}
          </Select>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <input
            type="checkbox"
            {...register("has_manual")}
            className="w-4 h-4 text-primary"
          />
          <label className="dark:text-white">설명서 포함</label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="대분류"
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
              const value = e.target.value;
              setSelectedMainCategory(value === "" ? null : Number(value));
              // 대분류가 변경될 때만 소분류를 초기화
              if (value === "") {
                setValue("categoryId", 0);
              }
            }}
            value={selectedMainCategory?.toString() || ""}
          >
            <option value="">대분류 선택</option>
            {categories
              .filter((cat) => !cat.parentId)
              .map((category) => (
                <option key={category.id} value={category.id.toString()}>
                  {category.icon} {category.kor_name}
                </option>
              ))}
          </Select>

          <Select
            label="소분류"
            {...register("categoryId")}
            errors={[errors.categoryId?.message ?? ""]}
            disabled={!selectedMainCategory}
            value={selectedCategoryId?.toString()}
          >
            <option value="">소분류 선택</option>
            {categories
              .filter((cat) => cat.parentId === selectedMainCategory)
              .map((category) => (
                <option key={category.id} value={category.id.toString()}>
                  {category.icon} {category.kor_name}
                </option>
              ))}
          </Select>
        </div>

        <Input
          type="textarea"
          required
          placeholder="제품에 대한 상세한 설명을 입력해주세요"
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
        {/* <TagInput
          onTagsChange={(tags) => setValue("tags", tags)}
          errors={[errors.tags?.message ?? ""]}
          maxTags={5}
          defaultTags={product.search_tags.map((tag) => tag.name)}
        /> */}

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
            href={`/products/${product.id}`}
          >
            취소
          </Link>
        </div>
      </form>
    </div>
  );
}
