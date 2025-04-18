/**
File Name : app/products/[id]/edit/page
Description : 제품 편집 페이지
Author : 임도헌

History
Date        Author   Status    Description
2024.11.02  임도헌   Created
2024.11.02  임도헌   Modified  제품 편집 페이지 추가
2024.12.12  임도헌   Modified  제품 대표 사진 하나 들고오기
2024.12.19  임도헌   Modified  보드게임 형식으로 수정
2024.12.19  임도헌   Modified  타입 정의 추가
2024.12.29  임도헌   Modified  보트포트 형식에 맞게 제품 수정 폼 변경
2025.04.18  임도헌   Modified  삭제하기 버튼 마진 삭제
*/

import { notFound, redirect } from "next/navigation";
import { getIsOwner } from "../actions";
import ProductEditForm from "@/components/product-edit-form";
import db from "@/lib/db";
import { getCategories, getProduct } from "./actions";

export default async function EditPage({ params }: { params: { id: string } }) {
  // 제품 아이디
  const id = Number(params.id);
  if (isNaN(id)) {
    return notFound();
  }

  // 제품 정보
  const product = await getProduct(id);
  if (!product) {
    return notFound();
  }

  // 작성자가 아니라면 홈으로
  const isOwner = await getIsOwner(product.userId);
  if (!isOwner) {
    redirect("/home");
  }

  // 카테고리 정보 가져오기
  const categories = await getCategories();

  const handleDeleteProduct = async () => {
    "use server";
    await db.product.delete({
      where: {
        id,
      },
    });
    redirect("/products");
  };

  return (
    <div className="min-h-screen dark:bg-neutral-900 bg-white p-4">
      <h1 className="text-2xl font-bold mb-6 dark:text-white">
        보드게임 제품 수정
      </h1>
      <ProductEditForm product={product} categories={categories} />
      <form
        action={handleDeleteProduct}
        className="flex items-center justify-center"
      >
        <button className="bg-rose-700 hover:bg-rose-500 text-[10px] w-full mx-5 py-3 rounded-md text-white font-semibold sm:text-sm md:text-md">
          삭제하기
        </button>
      </form>
    </div>
  );
}
