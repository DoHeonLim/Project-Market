/**
File Name : components/product/ProductForm
Description : 제품 등록,편집 폼 컴포넌트
Author : 임도헌

History
Date        Author   Status    Description
2025.06.12  임도헌   Created
2025.06.12  임도헌   Modified  제품 등록 폼 컴포넌트로 분리
2025.06.15  임도헌   Modified  제품 편집 컴포넌트를 병합해서 등록, 편집 통합 폼으로 리팩토링 
2025.09.10  임도헌   Modified  getUploadUrl 유니온 분기 처리로 TS 에러 해결 + File 타입 가드
*/

/** 제품 수정 컴포넌트 히스토리
File Name : components/product/ProductEditForm

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
2025.06.15  임도헌   Modified  통합된 제품 폼으로 병합
2025.06.18  임도헌   Modified  제품 등록 시 id를 zod에서 optional로 지정해서 오류 해결
 */
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Category } from "@prisma/client";
import { useImageUpload } from "@/hooks/useImageUpload";
import ImageUploader from "@/components/image/ImageUploader";
import Input from "@/components/common/Input";
import Select from "@/components/common/Select";
import Button from "@/components/common/Button";
import TagInput from "@/components/common/TagInput";
import Link from "next/link";
import {
  COMPLETENESS_TYPES,
  CONDITION_TYPES,
  GAME_TYPES,
  COMPLETENESS_DISPLAY,
  CONDITION_DISPLAY,
  GAME_TYPE_DISPLAY,
} from "@/lib/constants";
import { getUploadUrl } from "@/lib/cloudflare/getUploadUrl";

import { toast } from "sonner";
import {
  productFormSchema,
  productFormType,
} from "@/lib/product/form/productFormSchema";
import { ProductFormAction } from "@/types/product";

interface ProductFormProps {
  mode: "create" | "edit";
  action: ProductFormAction;
  defaultValues?: Partial<productFormType>;
  categories: Category[];
  submitText?: string;
  cancelHref?: string;
}

export default function ProductForm({
  mode,
  action,
  defaultValues = {},
  categories,
  cancelHref = "/products",
}: ProductFormProps) {
  const router = useRouter();
  const [resetSignal, setResetSignal] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const initialMainCategory = useMemo<number | null>(() => {
    if (!defaultValues?.categoryId) return null;
    return (
      categories.find((c) => c.id === defaultValues.categoryId)?.parentId ??
      null
    );
  }, [categories, defaultValues?.categoryId]);

  const [selectedMainCategory, setSelectedMainCategory] = useState<
    number | null
  >(initialMainCategory);

  // 대/소분류 옵션
  const mainCategories = useMemo(
    () => categories.filter((c) => !c.parentId),
    [categories]
  );
  const subCategories = useMemo(
    () => categories.filter((c) => c.parentId === selectedMainCategory),
    [categories, selectedMainCategory]
  );
  const subDisabled = !selectedMainCategory;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    control,
    formState: { errors },
    getValues,
    resetField,
  } = useForm<productFormType>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      id: defaultValues.id || 0,
      title: defaultValues.title || "",
      description: defaultValues.description || "",
      price: defaultValues.price,
      photos: defaultValues.photos || [],
      game_type: defaultValues.game_type || "BOARD_GAME",
      min_players: defaultValues.min_players,
      max_players: defaultValues.max_players,
      play_time: defaultValues.play_time,
      condition: defaultValues.condition || "NEW",
      completeness: defaultValues.completeness || "PERFECT",
      has_manual: defaultValues.has_manual ?? true,
      categoryId: defaultValues.categoryId ?? undefined,
      tags: defaultValues.tags || [],
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
    resetImage,
  } = useImageUpload({ maxImages: 5, setValue, getValues });

  useEffect(() => {
    if (
      Array.isArray(defaultValues.photos) &&
      defaultValues.photos.length > 0
    ) {
      setPreviews(defaultValues.photos.map((url) => url + "/public"));
      setValue("photos", defaultValues.photos);
    }
  }, [defaultValues.photos, setValue, setPreviews]);

  const minPlayers = watch("min_players");
  const maxPlayers = watch("max_players");
  useEffect(() => {
    if (minPlayers > maxPlayers) setValue("max_players", minPlayers);
  }, [minPlayers, maxPlayers, setValue]);

  useEffect(() => {
    if (defaultValues.categoryId && categories.length > 0) {
      const currentCategory = categories.find(
        (cat) => cat.id === defaultValues.categoryId
      );
      if (currentCategory?.parentId) {
        setSelectedMainCategory(currentCategory.parentId);
        setValue("categoryId", defaultValues.categoryId);
      }
    }
  }, [categories, defaultValues.categoryId, setValue]);

  const onSubmit = handleSubmit(async (data) => {
    if (mode === "create" && files.length === 0) {
      toast.error("최소 1개 이상의 이미지를 업로드해주세요.");
      return;
    }

    setIsUploading(true);
    try {
      const newFiles = files.filter((file) => file instanceof File);
      const uploadedPhotoUrls: string[] = [];

      if (newFiles.length > 0) {
        const uploadPromises = newFiles.map(async (file) => {
          const res = await getUploadUrl();
          if (!res.success) {
            throw new Error(res.error || "Failed to get upload URL");
          }

          const { uploadURL, id } = res.result;

          const cloudflareForm = new FormData();
          cloudflareForm.append("file", file);

          const response = await fetch(uploadURL, {
            method: "POST",
            body: cloudflareForm,
          });

          if (!response.ok) {
            throw new Error("Failed to upload image");
          }

          return `https://imagedelivery.net/3o3hwIVwLhMgAkoMCda2JQ/${id}`;
        });
        const urls = await Promise.all(uploadPromises);
        uploadedPhotoUrls.push(...urls);
      }

      const allPhotos: string[] = previews
        .map((preview) => {
          if (preview.includes("imagedelivery.net")) {
            return preview.replace("/public", "");
          } else if (preview.startsWith("blob:")) {
            const blobUrls = previews.filter((p) => p.startsWith("blob:"));
            const index = blobUrls.indexOf(preview);
            return uploadedPhotoUrls[index] ?? "";
          }
          return preview;
        })
        .filter((url): url is string => !!url);

      const formData = new FormData();
      if (mode === "edit") {
        const productId = defaultValues.id ? defaultValues.id.toString() : "0";
        formData.append("id", productId);
      }
      Object.entries(data).forEach(([key, value]) => {
        if (key === "tags") {
          formData.append(key, JSON.stringify(value));
          return;
        }
        if (key === "photos" || key === "id") return;

        // 추가: 안전 가드
        if (value === undefined || value === null) return;

        formData.append(key, value.toString());
      });
      allPhotos.forEach((url) => formData.append("photos[]", url));

      const result = await action(formData);
      if (result?.success) {
        if (mode === "create") {
          toast.success("🎉 제품 등록 완료!.");
          router.replace(`/products/view/${result.productId}`);
        } else if (mode === "edit") {
          toast.success("🎉 제품 수정 완료!.");
          router.back();
          router.refresh(); // ✨ hydration mismatch 방지 및 최신 데이터 강제 로딩
        }
      } else if (result?.error) {
        toast.error("오류가 발생했습니다. 다시 시도해주세요.");
      }
    } catch (err) {
      console.error("upload error:", err);
      toast.error("처리 중 오류가 발생했습니다.");
    } finally {
      setIsUploading(false);
    }
  });

  const resetForm = () => {
    resetImage();
    reset();
    setResetSignal((s) => s + 1);
    setSelectedMainCategory(null);
  };

  const handleMainCategoryChange = (value: string) => {
    const id = value ? Number(value) : null;
    setSelectedMainCategory(id);
    resetField("categoryId");
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5 p-5">
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
      {previews.length === 0 && mode === "create" && (
        <p className="text-sm text-red-500 px-2">
          최소 1개 이상의 이미지를 업로드해주세요.
        </p>
      )}

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
          placeholder="최저 인원"
          min={1}
          {...register("min_players")}
          errors={[errors.min_players?.message ?? ""]}
        />
        <Input
          type="number"
          required
          placeholder="최대 인원"
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

      <div className="flex items-center gap-2">
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
          value={selectedMainCategory?.toString() || ""}
          onChange={(e) => handleMainCategoryChange(e.target.value)}
          errors={errors.categoryId?.message ? [errors.categoryId.message] : []}
        >
          <option value="">대분류 선택</option>
          {mainCategories.map((c) => (
            <option key={c.id} value={String(c.id)}>
              {c.icon} {c.kor_name}
            </option>
          ))}
        </Select>

        <div
          className={
            subDisabled ? "opacity-60 pointer-events-none select-none" : ""
          }
          aria-disabled={subDisabled}
        >
          <Select
            label="소분류"
            {...register("categoryId", {
              setValueAs: (v) => (v === "" ? undefined : Number(v)),
            })}
            errors={
              errors.categoryId?.message ? [errors.categoryId.message] : []
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
      </div>

      <TagInput
        name="tags"
        control={control}
        maxTags={5}
        resetSignal={resetSignal}
      />

      <Button
        text={
          isUploading
            ? mode === "edit"
              ? "수정 중..."
              : "업로드 중..."
            : mode === "edit"
              ? "수정하기"
              : "등록하기"
        }
        disabled={isUploading}
      />

      <div className="flex gap-2">
        <button
          type="button"
          onClick={resetForm}
          className="flex-1 h-10 font-semibold text-white bg-red-500 rounded-md hover:bg-red-600"
        >
          초기화
        </button>
        <Link
          href={cancelHref}
          className="flex-1 h-10 font-semibold text-white bg-neutral-500 rounded-md flex items-center justify-center hover:bg-neutral-600"
        >
          취소
        </Link>
      </div>
    </form>
  );
}
