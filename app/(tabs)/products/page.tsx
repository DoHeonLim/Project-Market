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
2025.06.18  임도헌   Modified  ProductList에 쿼리 문자열을 기준으로 key를 부여해서 제품 재렌더링
2025.07.30  임도헌   Modified  fetchProductCategories로 이름 변경
*/

import ProductList from "@/components/product/ProductList";
import SearchResultSummary from "@/components/product/SearchResultSummary";
import ProductEmptyState from "@/components/product/ProductEmptyState";
import AddProductButton from "@/components/product/AddProductButton";
import SearchSection from "@/components/search/SearchSection";

import { formatSearchSummary } from "@/lib/product/formatSearchParams";
import { fetchProductCategories } from "@/lib/category/fetchProductCategories";
import { getCategoryName } from "@/lib/category/getCategoryName";
import { searchProducts } from "./actions/search";
import { getInitialProducts } from "./actions/init";
import { getPopularSearches, getUserSearchHistory } from "./actions/history";
import { GAME_TYPE_DISPLAY } from "@/lib/constants";
import ClientFilterWrapper from "@/components/search/ClientFilterWrapper";
import { SearchProvider } from "@/components/providers/SearchProvider";

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
      fetchProductCategories(),
      getUserSearchHistory(),
      getPopularSearches(),
    ]);

  const categoryName = searchParams.category
    ? getCategoryName(searchParams.category, categories)
    : "";

  const gameType = searchParams.game_type
    ? GAME_TYPE_DISPLAY[
        searchParams.game_type as keyof typeof GAME_TYPE_DISPLAY
      ]
    : undefined;

  const resultSearchParams = formatSearchSummary(
    categoryName,
    gameType,
    searchParams.keyword
  );

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-background to-background/95 dark:from-background-dark dark:to-background-dark/95">
      {/* 검색 섹션*/}
      <SearchProvider searchParams={searchParams}>
        <SearchSection
          categories={categories}
          keyword={searchParams.keyword}
          searchHistory={searchHistory}
          popularSearches={popularSearches}
          basePath="/products"
        />

        <div className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div
            className={`flex ${hasSearchParams ? "justify-between" : "justify-end"}`}
          >
            {/* 검색 결과 요약 */}
            <SearchResultSummary
              count={initialProducts.products.length}
              summaryText={resultSearchParams}
            />

            {/* 필터 섹션 */}
            <ClientFilterWrapper
              categories={categories}
              filters={searchParams}
            />
          </div>

          {/* 제품 목록 */}
          {initialProducts.products.length > 0 ? (
            // searchParams가 바뀌면 key도 바뀌어 재렌더됨
            <ProductList
              key={JSON.stringify(searchParams)}
              initialProducts={initialProducts}
            />
          ) : (
            <ProductEmptyState hasSearchParams={hasSearchParams} />
          )}
        </div>
      </SearchProvider>

      {/* 제품 추가 버튼 */}
      <AddProductButton />
    </div>
  );
}
