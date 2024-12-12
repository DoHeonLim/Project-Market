/**
File Name : app/products/[id]/edit/page
Description : 제품 편집 페이지
Author : 임도헌

History
Date        Author   Status    Description
2024.11.02  임도헌   Created
2024.11.02  임도헌   Modified  제품 편집 페이지 추가
2024.12.12  임도헌   Modified  제품 대표 사진 하나 들고오기
*/

import { notFound, redirect } from "next/navigation";
import { getIsOwner } from "../page";
import ProductEditForm from "@/components/product-edit-form";
import db from "@/lib/db";

async function getProduct(id: number) {
  const product = await db.product.findUnique({
    where: { id },
    select: {
      images: {
        orderBy: {
          order: "asc",
        },
      },
      title: true,
      price: true,
      description: true,
      id: true,
      userId: true,
    },
  });
  return product;
}

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
    <>
      <ProductEditForm product={product} />
      <form
        action={handleDeleteProduct}
        className="flex items-center justify-center"
      >
        <button className="bg-rose-700 hover:bg-rose-500 text-[10px] w-full mx-5 py-3 rounded-md text-white font-semibold sm:text-sm md:text-md">
          삭제하기
        </button>
      </form>
    </>
  );
}
