/**
 * File Name : hooks/useInfiniteScroll
 * Description : 공통 무한 스크롤 관찰 훅
 * Author : 임도헌
 *
 * History
 * 2025.06.07  임도헌   Created   IntersectionObserver 기반 무한 스크롤 훅 구현
 * 2025.08.26  임도헌   Modified  enabled 옵션/여유 rootMargin/threshold 추가, 비동기 onLoadMore 안전 호출
 * 2025.08.26  임도헌   Modified  useInfiniteScroll ref 최적화
 * 2025.09.10  임도헌   Modified  내부 in-flight 가드(runningRef), triggerRef.current 의존성 캡처, root 옵션 지원
 */

"use client";

import { useEffect, useRef } from "react";

interface UseInfiniteScrollProps {
  triggerRef: React.RefObject<Element>; // 스크롤 트리거가 될 요소 ref
  hasMore: boolean; // 더 불러올 데이터가 존재하는지 여부
  isLoading: boolean; // 로딩 중 여부(상위 state)
  onLoadMore: () => void | Promise<void>; // 데이터 더 불러오기 콜백(동기/비동기 가능)

  /**
   * 추가 옵션
   * - enabled: false이면 관찰/호출 중단(예: 탭 비가시 상태에서 중단)
   * - root: 스크롤 컨테이너(Element). 기본: viewport
   * - rootMargin: 조기 로딩 여유 영역. 기본: "1200px 0px 0px 0px"
   * - threshold: 교차 임계값(0~1). 기본: 0.01
   */
  enabled?: boolean;
  root?: Element | null;
  rootMargin?: string;
  threshold?: number;
}

export function useInfiniteScroll({
  triggerRef,
  hasMore,
  isLoading,
  onLoadMore,
  enabled = true,
  root = null,
  rootMargin = "1200px 0px 0px 0px",
  threshold = 0.01,
}: UseInfiniteScrollProps): void {
  const hasMoreRef = useRef(hasMore);
  const isLoadingRef = useRef(isLoading);
  const onLoadMoreRef = useRef(onLoadMore);
  const runningRef = useRef(false); // 훅 내부 즉시 가드(중복 호출 방지)

  useEffect(() => {
    hasMoreRef.current = hasMore;
  }, [hasMore]);

  useEffect(() => {
    isLoadingRef.current = isLoading;
  }, [isLoading]);

  useEffect(() => {
    onLoadMoreRef.current = onLoadMore;
  }, [onLoadMore]);

  // ref 대상 교체 감지를 위해 current를 캡처해서 deps에 포함
  const el = triggerRef.current;

  useEffect(() => {
    if (!enabled || !el) return;

    // iOS 구형 등 환경에서 IntersectionObserver가 없다면 조용히 종료(필요 시 스크롤 리스너 대체 구현 가능)
    if (typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting) return;

        // 부모 상태 + 내부 가드 모두 확인
        if (!hasMoreRef.current || isLoadingRef.current || runningRef.current)
          return;

        // 중복 호출 방지: onLoadMore 완료/실패까지 잠깐 잠금
        runningRef.current = true;
        Promise.resolve(onLoadMoreRef.current())
          .catch(console.error)
          .finally(() => {
            runningRef.current = false;
          });
      },
      { threshold, rootMargin, root }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [el, enabled, root, rootMargin, threshold]);
}

export default useInfiniteScroll;
