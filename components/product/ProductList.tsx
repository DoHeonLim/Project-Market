/**
File Name : components/product/ProductList
Description : 제품 목록 컴포넌트 (무한 스크롤 포함)
Author : 임도헌

History
Date        Author   Status    Description
2024.10.14  임도헌   Created
2024.10.14  임도헌   Modified  제품 컴포넌트 추가
2024.10.17  임도헌   Modified  무한 스크롤 기능 추가
2024.12.12  임도헌   Modified  스타일 수정
2024.12.17  임도헌   Modified  스타일 수정
2024.12.24  임도헌   Modified  스타일 재 수정
2025.04.29  임도헌   Modified  검색 결과가 변경될 때마다 제품 목록 업데이트 되도록 수정
2025.04.30  임도헌   Modified  성능 최적화 및 사용자 경험 개선
2025.05.06  임도헌   Modified  그리드/리스트 뷰 모드 추가
2025.06.07  임도헌   Modified  nextCursor 기반 페이지네이션 적용 및 props 구조 변경
2025.06.07  임도헌   Modified  무한 스크롤 훅 useInfiniteScroll 분리 적용
2025.06.07  임도헌   Modified  ProductCard 기반으로 구조 정리
2025.08.26  임도헌   Modified  usePageVisibility + 새 useInfiniteScroll 옵션 추가
*/
"use client";

import { useRef, useState } from "react";
import { Squares2X2Icon, ListBulletIcon } from "@heroicons/react/24/outline";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { useProductPagination } from "@/hooks/useProductPagination";
import ProductCard from "./productCard";
import { Products } from "@/types/product";
import { usePageVisibility } from "@/hooks/usePageVisibility";

type ProductListProps = {
  initialProducts: Products;
};

export default function ProductList({ initialProducts }: ProductListProps) {
  const triggerRef = useRef<HTMLSpanElement>(null);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  const isVisible = usePageVisibility();

  const { products, isLoading, hasMore, loadMore } = useProductPagination({
    initialProducts: initialProducts.products,
    initialCursor: initialProducts.nextCursor,
  });

  useInfiniteScroll({
    triggerRef,
    hasMore,
    isLoading,
    onLoadMore: loadMore,
    enabled: isVisible,
    // 상품 카드는 이미지가 커서 넉넉하게 미리 불러온다.
    rootMargin: "1400px 0px 0px 0px",
    threshold: 0.01,
  });

  return (
    <div className="flex flex-col gap-6">
      {/* 뷰 모드 전환 버튼 */}
      <div className="flex justify-end gap-2">
        <button
          onClick={() => setViewMode("list")}
          className={`p-2 rounded-lg transition-colors ${
            viewMode === "list"
              ? "bg-primary/10 text-primary dark:bg-primary-light/10 dark:text-primary-light"
              : "text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          }`}
          aria-label="리스트 뷰"
        >
          <ListBulletIcon className="size-5" />
        </button>
        <button
          onClick={() => setViewMode("grid")}
          className={`p-2 rounded-lg transition-colors ${
            viewMode === "grid"
              ? "bg-primary/10 text-primary dark:bg-primary-light/10 dark:text-primary-light"
              : "text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          }`}
          aria-label="그리드 뷰"
        >
          <Squares2X2Icon className="size-5" />
        </button>
      </div>

      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 p-8 text-text/80 dark:text-text-dark/80">
          <span className="text-4xl animate-float">🌊</span>
          <p className="text-lg font-medium text-center">
            아직 항해중인 보드게임이 없습니다
          </p>
          <p className="text-sm text-center">
            첫 번째 보드게임을 등록하고 새로운 항해를 시작해보세요!
          </p>
        </div>
      ) : (
        <>
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-2 gap-4 sm:gap-6"
                : "flex flex-col gap-4"
            }
          >
            {products.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                viewMode={viewMode}
                isPriority={index < 3}
              />
            ))}
          </div>

          {hasMore && (
            <span
              ref={triggerRef}
              className="mb-96 text-sm font-medium bg-primary/10 dark:bg-primary-light/10 text-primary dark:text-primary-light w-fit mx-auto px-4 py-2 rounded-full hover:bg-primary/20 dark:hover:bg-primary-light/20 active:scale-95 transition-all cursor-pointer flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <span className="animate-spin">🌊</span> 항해중...
                </>
              ) : (
                <>
                  <span>⚓</span> 더 많은 보드게임 찾기
                </>
              )}
            </span>
          )}
        </>
      )}
    </div>
  );
}
