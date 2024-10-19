/**
File Name : app/products/add/page
Description : 제품 업로드 페이지
Author : 임도헌

History
Date        Author   Status    Description
2024.10.17  임도헌   Created
2024.10.17  임도헌   Modified  제품 업로드 페이지 추가
2024.10.19  임도헌   Modified  폼 에러 추가
*/
"use client";

import Button from "@/components/button";
import Input from "@/components/input";
import { PhotoIcon } from "@heroicons/react/24/solid";
import { useState } from "react";
import { uploadProduct } from "./action";
import Link from "next/link";
import { MAX_PHOTO_SIZE } from "@/lib/constants";
import { useFormState } from "react-dom";

export default function AddProduct() {
  const [preview, setPreview] = useState("");

  // 이미지 크기 제한

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

    const url = URL.createObjectURL(file);
    setPreview(url);
  };
  // 폼 리셋
  const reset = () => setPreview("");
  const [state, action] = useFormState(uploadProduct, null);
  return (
    <div>
      <form action={action} className="flex flex-col gap-5 p-5">
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
          errors={state?.fieldErrors.title}
        />
        <Input
          name="price"
          type="number"
          required
          placeholder="가격"
          errors={state?.fieldErrors.price}
        />
        <Input
          name="description"
          type="text"
          required
          placeholder="설명"
          errors={state?.fieldErrors.description}
        />
        <Button text="작성 완료" />
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
