/**
File Name : components/edit-form
Description : 편집 폼 컴포넌트
Author : 임도헌

History
Date        Author   Status    Description
2024.11.02  임도헌   Created
2024.11.02  임도헌   Modified  편집 폼 컴포넌트 추가
2024.11.12  임도헌   Modified  제품 수정 클라우드 플레어로 리팩토링
*/
"use client";

import Button from "@/components/button";
import Input from "@/components/input";
import { MAX_PHOTO_SIZE } from "@/lib/constants";
import { PhotoIcon } from "@heroicons/react/24/solid";
import Link from "next/link";
import { useEffect, useState } from "react";
import { editProduct, getUploadUrl } from "@/app/products/[id]/edit/actions";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  productEditSchema,
  ProductEditType,
} from "@/app/products/[id]/edit/schema";

interface IEditFormProps {
  product: {
    id: number;
    title: string;
    photo: string;
    description: string;
    price: number;
  };
}

export default function EditForm({ product }: IEditFormProps) {
  // 이미지 미리보기
  const [preview, setPreview] = useState("");
  // 클라우드 플레어 이미지 업로드 URL
  const [uploadUrl, setUploadUrl] = useState("");
  // 선택한 이미지
  const [file, setFile] = useState<File | null>(null);
  // 기존 이미지 경로 관리
  const [currentPhoto, setCurrentPhoto] = useState(product.photo);

  //react hook form 사용 및 초기값 세팅
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProductEditType>({
    resolver: zodResolver(productEditSchema),
    defaultValues: {
      title: product.title,
      price: product.price,
      description: product.description,
      photo: product.photo,
    },
  });

  useEffect(() => {
    if (product.photo) {
      setPreview(product.photo + "/public");
      setCurrentPhoto(product.photo);
      setValue("photo", product.photo);
    }
  }, [product.photo, setValue]);

  const handleImageChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const {
      target: { files },
    } = event;
    if (!files) {
      return;
    }
    const file = files[0];

    // 이미지 크기 제한 검사
    if (file.size > MAX_PHOTO_SIZE) {
      alert("이미지는 3MB 이하로 올려주세요.");
      event.target.value = "";
      return;
    }

    const url = URL.createObjectURL(file);
    // 미리보기 세팅
    setPreview(url);
    // 이미지 파일 세팅
    setFile(file);
    // 클라우드 플레어 업로드 이미지 링크 가져오기
    const { success, result } = await getUploadUrl();
    if (success) {
      const { id, uploadURL } = result;
      setUploadUrl(uploadURL);
      setValue(
        "photo",
        `https://imagedelivery.net/3o3hwIVwLhMgAkoMCda2JQ/${id}`
      );
    }
  };
  // 폼 리셋
  const reset = () => {
    setPreview("");
    setFile(null);
    setValue("photo", "");
    const fileInput = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const onSubmit = handleSubmit(async (data: ProductEditType) => {
    // 새 이미지가 있는 경우에만 업로드
    if (file) {
      //클라우드 플레어에 이미지 업로드
      const cloudflareForm = new FormData();
      cloudflareForm.append("file", file);
      const response = await fetch(uploadUrl, {
        method: "POST",
        body: cloudflareForm,
      });
      if (response.status !== 200) {
        alert("이미지 업로드에 실패했습니다.");
        return;
      }
    } else {
      // 이미지가 변경되지 않았다면 기존 이미지 경로 사용
      data.photo = currentPhoto;
    }
    // 이미지가 업로드 되면 formData의 photo를 교체
    const formData = new FormData();
    formData.append("id", product.id + "");
    formData.append("photo", data.photo);
    formData.append("title", data.title);
    formData.append("description", data.description);
    formData.append("price", data.price + "");

    // editProduct를 리턴한다.
    return editProduct(formData);
  });

  const onValid = async () => {
    await onSubmit();
  };

  return (
    <div>
      <form action={onValid} className="flex flex-col gap-5 p-5">
        <input type="hidden" name="id" defaultValue={product.id} />
        <label
          htmlFor="photo"
          className="flex flex-col items-center justify-center bg-center bg-cover border-2 border-dashed rounded-md cursor-pointer aspect-square text-neutral-300 border-neutral-300"
          style={{ backgroundImage: `url(${preview})` }}
        >
          {preview === "" ? (
            <>
              <PhotoIcon aria-label="photo" className="w-20" />
              <div className="text-sm text-neutral-400">
                사진을 추가해주세요.
              </div>
              <div className="text-sm text-rose-700">
                {errors.photo?.message}
              </div>
            </>
          ) : null}
        </label>
        <input
          onChange={handleImageChange}
          type="file"
          id="photo"
          name="photo"
          accept="image/*"
          className="hidden"
        />
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
