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

/**
 * useProductPagination
 * 제품 목록을 커서 기반으로 페이지네이션 처리하기 위한 커스텀 훅.
 * - 제품 데이터를 받아오고, 다음 데이터를 불러올 수 있는 커서 정보를 상태로 관리.
 * - 무한 스크롤 기반의 페이징을 구현할 수 있도록 `useInfiniteScroll` 훅과 함께 사용.
 *
 * @param {ProductType[]} initialProducts - 초기 렌더링 시 받은 제품 목록
 * @param {number | null} initialCursor - 다음 페이지 요청을 위한 커서. null이면 더 이상 데이터가 없음
 *
 * @returns {object}
 * - products: 현재까지 로드된 전체 제품 목록
 * - cursor: 다음 요청에 사용할 커서 (number | null)
 * - isLoading: 데이터 로딩 중 여부
 * - hasMore: 다음 페이지가 존재하는지 여부
 * - loadMore: 다음 페이지를 불러오는 함수
 */
export function useProductPagination({
  initialProducts,
  initialCursor,
}: UseProductPagination) {
  const [products, setProducts] = useState(initialProducts);
  const [cursor, setCursor] = useState(initialCursor);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialCursor !== null);

  /**
   * loadMore
   * - 현재 커서를 기반으로 다음 제품 목록을 가져와 기존 목록에 병합.
   * - getMoreProducts 함수는 서버에서 다음 데이터를 반환하고 nextCursor도 함께 제공.
   */
  const loadMore = async () => {
    if (isLoading || !hasMore) return;
    setIsLoading(true);
    try {
      const newData = await getMoreProducts(cursor);
      setProducts((prev) => [...prev, ...newData.products]);
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
