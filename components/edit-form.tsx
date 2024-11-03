/**
File Name : components/edit-form
Description : 편집 폼 컴포넌트
Author : 임도헌

History
Date        Author   Status    Description
2024.11.02  임도헌   Created
2024.11.02  임도헌   Modified  편집 폼 컴포넌트 추가

*/
"use client";

import Button from "@/components/button";
import Input from "@/components/input";
import { MAX_PHOTO_SIZE } from "@/lib/constants";
import { PhotoIcon } from "@heroicons/react/24/solid";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useFormState } from "react-dom";
import { editProduct } from "@/app/products/[id]/edit/actions";

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
  const [preview, setPreview] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);

  // 컴포넌트 마운트 시 product.photo로 초기화
  useEffect(() => {
    if (product.photo) {
      setPreview(product.photo);
    }
  }, [product.photo]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const {
      target: { files },
    } = event;
    if (!files) {
      return;
    }

    const file = files[0];

    // 이미지 크기 체크
    if (file.size > MAX_PHOTO_SIZE) {
      alert("이미지는 3MB 이하로 올려주세요.");
      event.target.value = "";
      return;
    }

    setPhoto(file);
    const url = URL.createObjectURL(file);
    setPreview(url);
  };

  // 폼 리셋 시 원래 상품 이미지로 돌아가기
  const reset = () => {
    setPreview(product.photo);
    setPhoto(null);
    // file input 초기화
    const fileInput = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  };

  // form submit 전에 photo 상태 확인 및 처리
  const handleSubmit = async (formData: FormData) => {
    if (photo) {
      // 새로운 사진이 선택된 경우
      formData.set("photo", photo);
    } else {
      // 사진이 변경되지 않은 경우 기존 사진 경로 사용
      formData.set("photo", product.photo);
    }
    return action(formData);
  };

  const [state, action] = useFormState(editProduct, null);

  return (
    <div>
      <form action={handleSubmit} className="flex flex-col gap-5 p-5">
        <input type="hidden" name="id" defaultValue={product.id} />
        <label
          htmlFor="photo"
          className="flex flex-col items-center justify-center bg-center bg-cover border-2 border-dashed rounded-md cursor-pointer aspect-square text-neutral-300 border-neutral-300"
          style={{ backgroundImage: `url(${preview})` }}
        >
          {preview === "" ? (
            <>
              <PhotoIcon className="w-20" />
              <div className="text-sm text-neutral-400">
                사진을 추가해주세요.
                {state?.fieldErrors.photo}
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
          name="title"
          type="text"
          required
          placeholder="제목"
          defaultValue={product.title}
          errors={state?.fieldErrors.title}
        />
        <Input
          name="price"
          type="number"
          required
          placeholder="가격"
          defaultValue={product.price}
          errors={state?.fieldErrors.price}
        />
        <Input
          name="description"
          type="text"
          required
          placeholder="설명"
          defaultValue={product.description}
          errors={state?.fieldErrors.description}
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
