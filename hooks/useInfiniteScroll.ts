/**
 * File Name : hooks/useInfiniteScroll
 * Description : 공통 무한 스크롤 관찰 훅
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2025.06.07  임도헌   Created   IntersectionObserver 기반 무한 스크롤 훅 구현
 */

import { useEffect } from "react";

interface UseInfiniteScrollProps {
  triggerRef: React.RefObject<Element>; // 스크롤 트리거가 될 요소 ref
  hasMore: boolean; // 더 불러올 데이터가 존재하는지 여부
  isLoading: boolean; // 로딩 중 여부
  onLoadMore: () => void; // 데이터 더 불러오기 콜백
}

/**
 * useInfiniteScroll
 * 특정 요소가 화면에 일정 비율 보이면 onLoadMore 콜백을 실행하는 커스텀 훅입.
 * - IntersectionObserver API를 사용.
 * - 커서 기반 페이지네이션 로직을 가진 훅과 함께 사용.
 *
 * 주요 사용 대상: useProductPagination, usePostPagination, useStreamPagination 등
 *
 * @param {UseInfiniteScrollProps} props
 * @returns 없음
 */
export function useInfiniteScroll({
  triggerRef,
  hasMore,
  isLoading,
  onLoadMore,
}: UseInfiniteScrollProps) {
  useEffect(() => {
    if (!triggerRef.current || !hasMore || isLoading) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          onLoadMore();
        }
      },
      { threshold: 0.5, rootMargin: "100px" }
    );

    observer.observe(triggerRef.current);
    return () => observer.disconnect();
  }, [triggerRef, hasMore, isLoading, onLoadMore]);
}
