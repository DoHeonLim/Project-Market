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
2025.05.30  임도헌   Modified  add-product 페이지 products/add로 이동
2025.06.07  임도헌   Modified  검색 결과 요약, 제품 목록, 제품 추가 버튼을 컴포넌트로 분리, 구조 개선
*/

import ProductList from "@/components/product/ProductList";
import SearchResultSummary from "@/components/product/SearchResultSummary";
import ProductEmptyState from "@/components/product/ProductEmptyState";
import AddProductButton from "@/components/product/AddProductButton";
import SearchSection from "@/components/search/SearchSection";

import { formatSearchSummary } from "@/lib/product/formatSearchParams";
import { fetchCategories } from "@/lib/category/fetchCategories";
import { getCategoryName } from "@/lib/category/getCategoryName";
import { searchProducts } from "./actions/search";
import { getInitialProducts } from "./actions/init";
import { getPopularSearches, getUserSearchHistory } from "./actions/history";

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

  const [initialProducts, categories, searchHistory, popularSearches] =
    await Promise.all([
      hasSearchParams
        ? searchProducts({
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
        : getInitialProducts(),
      fetchCategories(),
      getUserSearchHistory(),
      getPopularSearches(),
    ]);

  const categoryName = searchParams.category
    ? getCategoryName(searchParams.category, categories)
    : "";

  const resultSearchParams = formatSearchSummary(
    categoryName,
    searchParams.game_type,
    searchParams.keyword
  );

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-background to-background/95 dark:from-background-dark dark:to-background-dark/95">
      {/* 검색 섹션*/}
      <SearchSection
        categories={categories}
        keyword={searchParams.keyword}
        searchParams={searchParams}
        searchHistory={searchHistory}
        popularSearches={popularSearches}
        basePath="/products"
      />

      <div className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
        {/* 검색 결과 요약 */}
        <SearchResultSummary
          count={initialProducts.products.length}
          summaryText={resultSearchParams}
        />

        {/* 제품 목록 */}
        {initialProducts.products.length > 0 ? (
          <ProductList initialProducts={initialProducts} />
        ) : (
          <ProductEmptyState hasSearchParams={hasSearchParams} />
        )}
      </div>

      {/* 제품 추가 버튼 */}
      <AddProductButton />
    </div>
  );
}
