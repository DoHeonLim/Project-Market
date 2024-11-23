/**
File Name : app/posts/add/page
Description : 동네생활 게시글 생성 페이지
Author : 임도헌

History
Date        Author   Status    Description
2024.11.23  임도헌   Created
2024.11.23  임도헌   Modified  동네생활 게시글 생성 페이지 추가
*/
"use client";

import Input from "@/components/input";
import Button from "@/components/button";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { postSchema, PostType } from "./schema";
import { uploadPost } from "./actions";

export default function AddPost() {
  // RHF 사용
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PostType>({
    resolver: zodResolver(postSchema),
  });

  const onSubmit = handleSubmit(async (data: PostType) => {
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("description", data.description);

    return uploadPost(formData);
  });

  const onValid = async () => {
    await onSubmit();
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
        <Button text="작성 완료" />
        <div className="flex gap-2">
          <button
            type="reset"
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
