/**
File Name : app/search/products/page.tsx
Description : 제품 검색 페이지
Author : 임도헌

History
Date        Author   Status    Description
2024.12.17  임도헌   Created
2024.12.17  임도헌   Modified  제품 검색 페이지 추가
*/
import {
  searchProducts,
  getCategories,
  getUserSearchHistory,
  getPopularSearches,
} from "@/app/search/products/actions";
import { notFound } from "next/navigation";
import ProductList from "@/components/product-list";
import SearchSection from "@/components/search/search-section";

interface SearchPageProps {
  searchParams: {
    keyword?: string;
    category?: string;
    minPrice?: string;
    maxPrice?: string;
    game_type?: string;
    condition?: string;
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  if (!searchParams.keyword && !Object.keys(searchParams).length) {
    notFound();
  }

  const products = await searchProducts({
    keyword: searchParams.keyword,
    category: searchParams.category,
    minPrice: searchParams.minPrice ? Number(searchParams.minPrice) : undefined,
    maxPrice: searchParams.maxPrice ? Number(searchParams.maxPrice) : undefined,
    game_type: searchParams.game_type,
    condition: searchParams.condition,
  });

  const categories = await getCategories();

  const searchHistory = await getUserSearchHistory();
  const popularSearches = await getPopularSearches();

  // 카테고리 이름 찾기
  const getCategoryName = (categoryId: string) => {
    const id = parseInt(categoryId);
    // 먼저 부모 카테고리에서 찾기
    const parentCategory = categories.find((cat) => cat.id === id);
    if (parentCategory) return parentCategory.name;

    // 자식 카테고리에서 찾기
    for (const parent of categories) {
      const childCategory = parent.children.find((child) => child.id === id);
      if (childCategory) {
        return `${parent.name} > ${childCategory.name}`;
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
    .filter(Boolean) // falsy 값(undefined, null, empty string) 제거
    .join(", "); // 쉼표와 공백으로 구분

  return (
    <div className="flex flex-col gap-4 p-4">
      <SearchSection
        categories={categories}
        keyword={searchParams.keyword}
        searchParams={searchParams}
        searchHistory={searchHistory}
        popularSearches={popularSearches}
        basePath="/search/products"
      />
      {/* 검색 결과 요약 */}
      <div className="px-4 text-sm text-gray-500 dark:text-gray-400">
        {resultSearchParams && (
          <p>
            <span className="font-semibold text-primary">
              {resultSearchParams}
            </span>
            에 대한 검색결과 ({products.length}개)
          </p>
        )}
      </div>

      {/* 검색 결과 */}
      {products.length > 0 ? (
        <ProductList initialProducts={products} />
      ) : (
        <div className="flex flex-col items-center justify-center gap-4 py-20">
          <p className="text-gray-500 dark:text-gray-400">
            검색 결과가 없습니다.
          </p>
        </div>
      )}
    </div>
  );
}
