/**
File Name : app/(tabs)/products/page
Description : 제품 페이지
Author : 임도헌

History
Date        Author   Status    Description
2024.10.14  임도헌   Created
2024.10.14  임도헌   Modified  제품 페이지 추가
2024.10.17  임도헌   Modified  무한 스크롤 기능 추가
2024-10-26  임도헌   Modified  데이터베이스 캐싱 기능 추가
2024-11-06  임도헌   Modified  캐싱기능 주석 처리
2024-12-05  임도헌   Modified  제품 초기화 기능 actions로 옮김
*/

import ProductList from "@/components/product-list";
import { PlusIcon } from "@heroicons/react/24/solid";
import { Prisma } from "@prisma/client";

// import { unstable_cache as nextCache, revalidatePath } from "next/cache";

import Link from "next/link";
import { getInitialProducts } from "./actions";

export type InitialProducts = Prisma.PromiseReturnType<
  typeof getInitialProducts
>;

export default async function Products() {
  const initialProducts = await getInitialProducts();
  return (
    <div>
      <ProductList initialProducts={initialProducts} />
      <Link
        href="products/add"
        className="fixed flex items-center justify-center text-white transition-colors bg-indigo-400 rounded-full size-16 bottom-24 right-8 hover:bg-indigo-500"
      >
        <PlusIcon aria-label="add_product" className="size-10" />
      </Link>
    </div>
  );
}
