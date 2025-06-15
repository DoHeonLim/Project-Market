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
2025.06.15  임도헌   Modified  제품 등록 및 편집 폼 통합
*/

import { notFound, redirect } from "next/navigation";
import ProductForm from "@/components/product/ProductForm";
import { getCachedProduct, getIsOwner } from "../actions/product";
import { fetchCategories } from "@/lib/category/fetchCategories";
import { convertProductToFormValues } from "@/lib/product/form/convertProductToFormValues";
import { deleteProduct } from "@/lib/product/delete/deleteProduct";
import { updateProductAction } from "../actions/update";

export default async function EditPage({ params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (isNaN(id)) return notFound();

  const product = await getCachedProduct(id);
  if (!product) return notFound();

  const isOwner = await getIsOwner(product.userId);
  if (!isOwner) redirect("/home");

  const categories = await fetchCategories();
  const defaultValues = convertProductToFormValues(product);

  const handleDeleteProduct = async () => {
    "use server";
    await deleteProduct(id);
    redirect("/products");
  };

  return (
    <div className="min-h-screen dark:bg-neutral-900 bg-white p-4">
      <h1 className="text-2xl font-bold mb-6 dark:text-white">
        보드게임 제품 수정
      </h1>
      <ProductForm
        mode="edit"
        action={updateProductAction}
        defaultValues={defaultValues}
        categories={categories}
      />
      <form
        action={handleDeleteProduct}
        className="flex items-center justify-center"
      >
        <button className="bg-rose-700 hover:bg-rose-500 text-[10px] w-full mx-5 py-2.5 rounded-md text-white font-semibold sm:text-sm md:text-md">
          삭제하기
        </button>
      </form>
    </div>
  );
}
