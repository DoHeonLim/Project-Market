/**
File Name : app/(tabs)/products/page
Description : 제품 페이지
Author : 임도헌

History
Date        Author   Status    Description
2024.10.14  임도헌   Created
2024.10.14  임도헌   Modified  제품 페이지 추가
2024.10.17  임도헌   Modified  무한 스크롤 기능 추가
*/

import ProductList from "@/components/product-list";
import db from "@/lib/db";
import { PlusIcon } from "@heroicons/react/24/solid";
import { Prisma } from "@prisma/client";
import Link from "next/link";

const getInitialProducts = async () => {
  const products = await db.product.findMany({
    select: {
      title: true,
      price: true,
      created_at: true,
      photo: true,
      id: true,
    },
    take: 1,
    orderBy: {
      created_at: "desc",
    },
  });
  return products;
};

export type InitialProducts = Prisma.PromiseReturnType<
  typeof getInitialProducts
>;

export default async function Products() {
  const initialProducts = await getInitialProducts();
  return (
    <div>
      <ProductList initialProducts={initialProducts} />
      <Link
        href="/products/add"
        className="fixed flex items-center justify-center text-white transition-colors bg-indigo-400 rounded-full size-16 bottom-24 right-8 hover:bg-indigo-500"
      >
        <PlusIcon className="size-10" />
      </Link>
    </div>
  );
}
