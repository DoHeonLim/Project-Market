/**
File Name : hooks/useProductPagination
Description : 제품 무한 스크롤을 위한 커서 기반 페이지네이션 훅
Author : 임도헌

History
Date        Author   Status    Description
2025.06.07  임도헌   Created   제품 목록 페이징 로직 전용 훅으로 분리
2025.06.07  임도헌   Modified  공통 useInfiniteScroll 훅에 대응하도록 로직 정리
*/
"use client";

import { useState } from "react";
import { getMoreProducts } from "@/app/(tabs)/products/actions/init";
import { ProductType } from "@/types/product";

interface UseProductPagination {
  initialProducts: ProductType[];
  initialCursor: number | null;
}

interface UseProductPaginationResult {
  products: ProductType[];
  cursor: number | null;
  isLoading: boolean;
  hasMore: boolean;
  loadMore: () => Promise<void>;
}

/**
 * 제품 목록을 커서 기반으로 페이지네이션 처리하기 위한 커스텀 훅.
 * - 제품 데이터를 받아오고, 다음 데이터를 불러올 수 있는 커서 정보를 상태로 관리.
 * - 무한 스크롤 기반의 페이징을 구현할 수 있도록 `useInfiniteScroll` 훅과 함께 사용.
 */
export function useProductPagination({
  initialProducts,
  initialCursor,
}: UseProductPagination): UseProductPaginationResult {
  const [products, setProducts] = useState(initialProducts);
  const [cursor, setCursor] = useState(initialCursor);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialCursor !== null);

  const loadMore = async () => {
    if (isLoading || !hasMore) return;
    setIsLoading(true);
    try {
      const newData = await getMoreProducts(cursor);
      if (newData.products.length > 0) {
        setProducts((prev) => [...prev, ...newData.products]);
      }
      setCursor(newData.nextCursor);
      setHasMore(newData.nextCursor !== null);
    } catch (error) {
      console.error("Failed to load more products:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    products,
    cursor,
    isLoading,
    hasMore,
    loadMore,
  };
}
