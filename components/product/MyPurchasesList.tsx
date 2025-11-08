/**
 * File Name : components/product/MyPurchasesList
 * Description : 나의 구매 제품 리스트 컴포넌트
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2024.12.02  임도헌   Created
 * 2024.12.02  임도헌   Modified  나의 구매 제품 리스트 컴포넌트
 * 2024.12.12  임도헌   Modified  photo속성에서 images로 변경
 * 2024.12.24  임도헌   Modified  다크모드 적용
 * 2024.12.29  임도헌   Modified  구매 제품 리스트 컴포넌트 스타일 수정
 * 2025.10.17  임도헌   Modified  useProductPagination(profile PURCHASED) + useInfiniteScroll 적용
 * 2025.11.06  임도헌   Modified  아이템 단위 갱신(updateOne) 연동
 */

"use client";

import { useRef } from "react";
import { useProductPagination } from "@/hooks/useProductPagination";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { usePageVisibility } from "@/hooks/usePageVisibility";
import MyPurchasesProductItem from "./MyPurchasesProductItem";
import type { MyPurchasedListItem, Paginated } from "@/types/product";

interface MyPurchasesListProps {
  userId: number;
  initialPurchased: Paginated<MyPurchasedListItem>;
}

export default function MyPurchasesList({
  initialPurchased,
  userId,
}: MyPurchasesListProps) {
  const purchased = useProductPagination<MyPurchasedListItem>({
    mode: "profile",
    scope: { type: "PURCHASED", userId },
    initialProducts: initialPurchased.products,
    initialCursor: initialPurchased.nextCursor,
  });

  const products = purchased.products;

  // 무한 스크롤 트리거
  const triggerRef = useRef<HTMLButtonElement>(null);
  const isVisible = usePageVisibility();

  useInfiniteScroll({
    triggerRef,
    hasMore: purchased.hasMore,
    isLoading: purchased.isLoading,
    onLoadMore: purchased.loadMore,
    enabled: isVisible,
    rootMargin: "1000px 0px 0px 0px",
    threshold: 0.01,
  });

  return (
    <div className="flex flex-col gap-6 mx-auto p-4">
      <h1 className="text-2xl font-semibold text-center text-primary dark:text-primary-light">
        구매 제품
      </h1>

      {products.length === 0 ? (
        <div className="bg-white dark:bg-neutral-800 rounded-xl p-8 text-center">
          <p className="text-neutral-500 dark:text-neutral-400">
            구매한 제품이 없습니다.
          </p>
          <a
            href="/products"
            className="inline-block mt-4 underline text-primary dark:text-primary-light"
          >
            제품 보러가기
          </a>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {products.map((product) => (
              <MyPurchasesProductItem
                key={product.id}
                product={product}
                // 하위 아이템에서 리뷰 작성/삭제 후 리스트에 즉시 반영
                onReviewChanged={(patch) =>
                  purchased.updateOne(product.id, patch)
                }
              />
            ))}
          </div>

          {purchased.hasMore && (
            <button
              ref={triggerRef}
              type="button"
              onClick={() => {
                if (!purchased.isLoading) purchased.loadMore();
              }}
              disabled={purchased.isLoading}
              className="mb-40 text-sm font-medium bg-primary/10 dark:bg-primary-light/10 text-primary dark:text-primary-light w-fit mx-auto px-4 py-2 rounded-full hover:bg-primary/20 dark:hover:bg-primary-light/20 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {purchased.isLoading ? (
                <>
                  <span className="animate-spin">🌊</span> 항해중...
                </>
              ) : (
                <>
                  <span>⚓</span> 더 보기
                </>
              )}
            </button>
          )}
        </>
      )}
    </div>
  );
}
