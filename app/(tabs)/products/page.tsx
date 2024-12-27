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
2024.12.12  임도헌   Modified  제품 추가 링크 변경
2024.12.16  임도헌   Modified  카테고리 얻기 기능 추가
2024.12.16  임도헌   Modified  최근 검색 기록 얻기 기능 추가
2024.12.16  임도헌   Modified  인기 검색 기록 얻기 기능 추가
2024.12.27  임도헌   Modified  제품 페이지 다크모드 추가
*/

import ProductList from "@/components/product-list";
import { PlusIcon } from "@heroicons/react/24/solid";
import { Prisma } from "@prisma/client";
import Link from "next/link";
import { getInitialProducts } from "./actions";
import {
  getCategories,
  getPopularSearches,
  getUserSearchHistory,
} from "@/app/search/products/actions";
import SearchSection from "@/components/search/search-section";

export type InitialProducts = Prisma.PromiseReturnType<
  typeof getInitialProducts
>;

interface ProductsPageProps {
  searchParams: {
    category?: string;
    keyword?: string;
  };
}

export default async function Products({ searchParams }: ProductsPageProps) {
  const initialProducts = await getInitialProducts(); // 초기 제품 얻기
  const categories = await getCategories(); // 카테고리 얻기
  const searchHistory = await getUserSearchHistory(); // 최근 검색 기록 얻기
  const popularSearches = await getPopularSearches(); // 인기 검색 기록 얻기

  return (
    <div className="flex flex-col gap-6 p-6 bg-gradient-to-b from-background to-background/95 dark:from-background-dark dark:to-background-dark/95">
      <SearchSection
        categories={categories}
        keyword={""}
        searchParams={searchParams}
        searchHistory={searchHistory}
        popularSearches={popularSearches}
        basePath="/search/products"
      />
      <ProductList initialProducts={initialProducts} />

      {/* 제품 추가 버튼 */}
      <Link
        href="add-product"
        className="fixed flex items-center justify-center text-white transition-colors bg-indigo-400 rounded-full size-16 bottom-24 right-8 hover:bg-indigo-500"
      >
        <PlusIcon aria-label="add_product" className="size-10" />
      </Link>
    </div>
  );
}
