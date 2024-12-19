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
2024.12.16  임도헌   Modified  제품 업로드를 보드게임 형식으로 변경
2024.12.18  임도헌   Modified  태그 입력 컴포넌트로 분리

*/
"use client";

import Button from "@/components/button";
import Input from "@/components/input";
import Link from "next/link";
import { useState, useEffect } from "react";
import { getUploadUrl, uploadProduct } from "./action";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  productSchema,
  ProductType,
  GAME_TYPES,
  CONDITION_TYPES,
  COMPLETENESS_TYPES,
} from "./schema";
import { useImageUpload } from "@/hooks/useImageUpload";
import ImageUploader from "@/components/image/image-uploader";
import { useRouter } from "next/navigation";
import Select from "@/components/select";
import { Category } from "@prisma/client";
import TagInput from "@/components/tag-input";

export default function AddProduct() {
  const router = useRouter();
  // 업로드 상태
  const [isUploading, setIsUploading] = useState(false);
  const [selectedMainCategory, setSelectedMainCategory] = useState<
    number | null
  >(null);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    // 카테고리 목록 가져오기
    const fetchCategories = async () => {
      const response = await fetch("/add-product/get-categories");
      if (!response.ok) {
        console.error("카테고리 로딩 실패");
        return;
      }
      const data = await response.json();
      setCategories(data);
    };

    fetchCategories();
  }, []);

  // react hook form 설정
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    getValues,
  } = useForm<ProductType>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      has_manual: true,
      min_players: 2,
      max_players: 4,
      play_time: "30-60분",
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
    reset: resetImages,
  } = useImageUpload({ maxImages: 5, setValue, getValues });

  // 최소 인원이 최대 인원보다 크지 않도록 감시
  const minPlayers = watch("min_players");
  const maxPlayers = watch("max_players");

  if (minPlayers > maxPlayers) {
    setValue("max_players", minPlayers);
  }

  const onSubmit = handleSubmit(async (data: ProductType) => {
    if (files.length === 0) {
      alert("최소 1개 이상의 이미지를 업로드해주세요.");
      return;
    }

    setIsUploading(true);

    try {
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
      Object.entries(data).forEach(([key, value]) => {
        if (key === "tags") {
          formData.append(key, JSON.stringify(value));
        } else if (key !== "photos") {
          formData.append(key, value.toString());
        }
      });
      uploadedPhotoUrls.forEach((url) => {
        formData.append("photos[]", url);
      });

      const result = await uploadProduct(formData);
      if (result?.success) {
        router.replace(`/products/${result.productId}`);
      } else if (result?.error) {
        alert(result.error);
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("업로드 중 오류가 발생했습니다.");
    } finally {
      setIsUploading(false);
    }
  });

  const handleReset = () => {
    resetImages();
    setValue("title", "");
    setValue("description", "");
    setValue("price", 0);
    setValue("game_type", "보드게임");
    setValue("min_players", 2);
    setValue("max_players", 4);
    setValue("play_time", "30-60분");
    setValue("condition", "새제품급");
    setValue("completeness", "구성품전체");
    setValue("has_manual", true);
  };

  return (
    <div className="min-h-screen dark:bg-neutral-900 bg-white p-4">
      <h1 className="text-2xl font-bold mb-6 dark:text-white">
        보드게임 제품 등록
      </h1>
      <form onSubmit={onSubmit} className="flex flex-col gap-5">
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
                {type}
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
                {type}
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
                {type}
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

        <Input
          type="textarea"
          required
          placeholder="제품에 대한 상세한 설명을 입력해주세요"
          {...register("description")}
          errors={[errors.description?.message ?? ""]}
          className="p-2 input-primary min-h-[200px] resize-y"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="대분류"
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
              const value = e.target.value;
              setSelectedMainCategory(value === "" ? null : Number(value));
              setValue("categoryId", 0);
            }}
            value={selectedMainCategory?.toString() || ""}
          >
            <option value="">대분류 선택</option>
            {categories
              .filter((cat) => !cat.parentId)
              .map((category) => (
                <option key={category.id} value={category.id.toString()}>
                  {category.icon} {category.name}
                </option>
              ))}
          </Select>

          <Select
            label="소분류"
            {...register("categoryId")}
            errors={[errors.categoryId?.message ?? ""]}
            disabled={!selectedMainCategory}
          >
            <option value="">소분류 선택</option>
            {categories
              .filter((cat) => cat.parentId === selectedMainCategory)
              .map((category) => (
                <option key={category.id} value={category.id.toString()}>
                  {category.icon} {category.name}
                </option>
              ))}
          </Select>
        </div>

        <TagInput
          onTagsChange={(tags) => setValue("tags", tags)}
          errors={[errors.tags?.message ?? ""]}
          maxTags={5}
        />

        <div className="flex gap-2 mt-4">
          <Button
            text={isUploading ? "업로드 중..." : "등록하기"}
            disabled={isUploading}
          />
          <button
            type="button"
            onClick={handleReset}
            className="flex-1 py-3 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
          >
            초기화
          </button>
          <Link
            href="/products"
            className="flex-1 py-3 bg-neutral-500 text-white rounded-md hover:bg-neutral-600 transition-colors text-center"
          >
            취소
          </Link>
        </div>
      </form>
    </div>
  );
}
