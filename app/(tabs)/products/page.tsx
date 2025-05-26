/**
File Name : app/(tabs)/products/page
Description : 제품 페이지
Author : 임도헌

History
Date        Author   Status    Description
2024.10.14  임도헌   Created
2024.10.14  임도헌   Modified  제품 페이지 추가
2024.10.17  임도헌   Modified  무한 스크롤 기능 추가
2024.10.26  임도헌   Modified  데이터베이스 캐싱 기능 추가
2024.11.06  임도헌   Modified  캐싱기능 주석 처리
2024.12.05  임도헌   Modified  제품 초기화 기능 actions로 옮김
2024.12.12  임도헌   Modified  제품 추가 링크 변경
2024.12.16  임도헌   Modified  카테고리 얻기 기능 추가
2024.12.16  임도헌   Modified  최근 검색 기록 얻기 기능 추가
2024.12.16  임도헌   Modified  인기 검색 기록 얻기 기능 추가
2024.12.27  임도헌   Modified  제품 페이지 다크모드 추가
2025.04.29  임도헌   Modified  검색 기능 search/products에서 products로 통합
*/

import ProductList from "@/components/product-list";
import { PlusIcon, MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import { Prisma } from "@prisma/client";
import Link from "next/link";
import {
  getCategories,
  getInitialProducts,
  getPopularSearches,
  getUserSearchHistory,
  searchProducts,
} from "./actions";

import SearchSection from "@/components/search/search-section";
export type InitialProducts = Prisma.PromiseReturnType<
  typeof getInitialProducts
>;

interface ProductsPageProps {
  searchParams: {
    category?: string;
    keyword?: string;
    minPrice?: string;
    maxPrice?: string;
    game_type?: string;
    condition?: string;
  };
}

export default async function Products({ searchParams }: ProductsPageProps) {
  const hasSearchParams = Object.keys(searchParams).length > 0;

  // 검색 파라미터가 있으면 검색 결과를, 없으면 초기 제품을 가져옵니다
  const products = hasSearchParams
    ? await searchProducts({
        keyword: searchParams.keyword,
        category: searchParams.category,
        minPrice: searchParams.minPrice
          ? Number(searchParams.minPrice)
          : undefined,
        maxPrice: searchParams.maxPrice
          ? Number(searchParams.maxPrice)
          : undefined,
        game_type: searchParams.game_type,
        condition: searchParams.condition,
      })
    : await getInitialProducts();

  const categories = await getCategories();
  const searchHistory = await getUserSearchHistory();
  const popularSearches = await getPopularSearches();

  // 카테고리 이름 찾기
  const getCategoryName = (categoryId: string) => {
    const id = parseInt(categoryId);
    // 먼저 부모 카테고리에서 찾기
    const parentCategory = categories.find((cat) => cat.id === id);
    if (parentCategory) return parentCategory.kor_name;

    // 자식 카테고리에서 찾기
    for (const parent of categories) {
      const childCategory = parent.children.find((child) => child.id === id);
      if (childCategory) {
        return `${parent.kor_name} > ${childCategory.kor_name}`;
      }
    }
    return categoryId; // 카테고리를 찾지 못한 경우
  };

  const categoryName = searchParams.category
    ? getCategoryName(searchParams.category)
    : "";

  const resultSearchParams = [
    searchParams.game_type,
    categoryName,
    searchParams.keyword,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-background to-background/95 dark:from-background-dark dark:to-background-dark/95">
      <SearchSection
        categories={categories}
        keyword={searchParams.keyword}
        searchParams={searchParams}
        searchHistory={searchHistory}
        popularSearches={popularSearches}
        basePath="/products"
      />

      <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
        {/* 검색 결과 요약 */}
        {hasSearchParams && (
          <div className="mb-6">
            {resultSearchParams && (
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <span className="font-medium">검색결과</span>
                  <span className="px-2 py-1 text-xs font-semibold bg-primary/10 dark:bg-primary-light/10 text-primary dark:text-primary-light rounded-full">
                    {products.length}개
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 제품 목록 */}
        {products.length > 0 ? (
          <ProductList initialProducts={products} />
        ) : (
          <div className="flex flex-col items-center justify-center gap-4 py-16 sm:py-20">
            <div className="p-4 rounded-full bg-gray-100 dark:bg-neutral-800">
              <MagnifyingGlassIcon className="size-8 text-gray-400 dark:text-gray-500" />
            </div>
            <p className="text-lg font-medium text-gray-500 dark:text-gray-400">
              {hasSearchParams
                ? "검색 결과가 없습니다."
                : "등록된 제품이 없습니다."}
            </p>
            {hasSearchParams && (
              <p className="text-sm text-gray-400 dark:text-gray-500">
                다른 검색어로 다시 시도해보세요.
              </p>
            )}
          </div>
        )}
      </main>

      {/* 제품 추가 버튼 */}
      <Link
        href="add-product"
        className="fixed flex items-center justify-center text-white transition-all duration-300 bg-primary dark:bg-primary-light rounded-full size-14 sm:size-16 bottom-20 sm:bottom-24 right-4 sm:right-8 hover:bg-primary-dark dark:hover:bg-primary-light-dark hover:scale-105 shadow-lg hover:shadow-xl"
      >
        <PlusIcon aria-label="add_product" className="size-8 sm:size-10" />
      </Link>
    </div>
  );
}
