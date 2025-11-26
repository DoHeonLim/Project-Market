/**
 * File Name : components/product/MySalesProductList
 * Description : 나의 판매 제품 리스트 컴포넌트 (탭별 지연 로드 + 공통 페이지네이션 훅)
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2024.11.30  임도헌   Created
 * 2024.11.30  임도헌   Modified  나의 판매 제품 리스트 컴포넌트
 * 2024.12.03  임도헌   Modified  purchase_at을 purchased_at으로 변경
 * 2024.12.12  임도헌   Modified  photo속성에서 images로 변경
 * 2024.12.24  임도헌   Modified  다크모드 적용
 * 2025.10.17  임도헌   Modified  탭별 지연 로드 + useProductPagination(profile) 도입
 * 2025.10.19  임도헌   Modified  하이브리드 낙관적 이동 + 실패시 롤백/리프레시
 * 2025.11.04  임도헌   Modified  getInitialUserProducts(서버) 직접 호출 제거 → fetchInitialUserProductsClient(API 경유)로 교체
 */

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import MySalesProductItem from "./MySalesProductItem";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { usePageVisibility } from "@/hooks/usePageVisibility";
import { useProductPagination } from "@/hooks/useProductPagination";
import type { MySalesListItem, Paginated, TabCounts } from "@/types/product";
import { fetchInitialUserProductsClient } from "@/lib/product/fetchInitialUserProducts.client";

type Tab = "selling" | "reserved" | "sold";

interface MySalesProductListProps {
  userId: number;
  /** 페이지에서 판매중(SELLING)만 선페치해서 넘겨받음 */
  initialSelling: Paginated<MySalesListItem>;
  initialCounts: TabCounts;
}

export default function MySalesProductList({
  userId,
  initialSelling,
  initialCounts,
}: MySalesProductListProps) {
  const [activeTab, setActiveTab] = useState<Tab>("selling");

  // 탭별 총 개수(라벨 표기용)
  const [counts, setCounts] = useState<TabCounts>(initialCounts);

  // 판매중: 서버 선로드 데이터로 초기화
  const selling = useProductPagination<MySalesListItem>({
    mode: "profile",
    scope: { type: "SELLING", userId },
    initialProducts: initialSelling.products,
    initialCursor: initialSelling.nextCursor,
  });

  // 예약중/판매완료: 탭 진입 시 최초 1회 서버에서 초기 번들 로드 후 reset
  const reserved = useProductPagination<MySalesListItem>({
    mode: "profile",
    scope: { type: "RESERVED", userId },
    initialProducts: [],
    initialCursor: null,
  });
  const sold = useProductPagination<MySalesListItem>({
    mode: "profile",
    scope: { type: "SOLD", userId },
    initialProducts: [],
    initialCursor: null,
  });

  // 탭별 초기 로드 여부
  const [reservedLoaded, setReservedLoaded] = useState(false);
  const [soldLoaded, setSoldLoaded] = useState(false);

  // 탭 데이터 새로고침 유틸 (의존성 안전)
  const refreshTab = useCallback(
    async (tab: Tab) => {
      if (tab === "selling") {
        const data = await fetchInitialUserProductsClient<MySalesListItem>({
          type: "SELLING",
          userId,
        });
        selling.reset({ products: data.products, cursor: data.nextCursor });
      } else if (tab === "reserved") {
        const data = await fetchInitialUserProductsClient<MySalesListItem>({
          type: "RESERVED",
          userId,
        });
        reserved.reset({ products: data.products, cursor: data.nextCursor });
        setReservedLoaded(true);
      } else {
        const data = await fetchInitialUserProductsClient<MySalesListItem>({
          type: "SOLD",
          userId,
        });
        sold.reset({ products: data.products, cursor: data.nextCursor });
        setSoldLoaded(true);
      }
    },
    [userId, selling, reserved, sold]
  );

  // 탭 전환 시, 아직 초기화 안 된 탭이면 최초 1회 로드
  useEffect(() => {
    (async () => {
      if (activeTab === "reserved" && !reservedLoaded) {
        await refreshTab("reserved");
      }
      if (activeTab === "sold" && !soldLoaded) {
        await refreshTab("sold");
      }
    })();
  }, [activeTab, reservedLoaded, soldLoaded, refreshTab]);

  // 하이브리드 낙관적 이동: from→to 로컬 리스트를 즉시 이동시키고 롤백 함수 반환
  const onOptimisticMove = useCallback(
    ({
      from,
      to,
      product,
    }: {
      from: Tab;
      to: Tab;
      product: MySalesListItem;
    }): (() => void) => {
      const snap = {
        selling: { products: selling.products, cursor: selling.cursor },
        reserved: { products: reserved.products, cursor: reserved.cursor },
        sold: { products: sold.products, cursor: sold.cursor },
        counts,
      };

      // reserved → sold로 옮길 때 구매자 필드 즉시 보정
      const nextProduct: MySalesListItem =
        from === "reserved" && to === "sold"
          ? ({
              ...product,
              // 예약자 → 구매자 승격
              purchase_userId: product.reservation_userId ?? null,
              purchase_user: product.reservation_user
                ? {
                    id: product.reservation_userId,
                    username: product.reservation_user.username,
                    avatar: product.reservation_user.avatar ?? null,
                  }
                : null,
              purchased_at: new Date().toISOString(),

              // 예약 필드 초기화
              reservation_userId: null,
              reservation_user: null,
              reservation_at: null,
            } as MySalesListItem)
          : product;

      const resetByTab = (
        tab: Tab,
        nextProducts: MySalesListItem[],
        keepCursor: number | null
      ) => {
        const target =
          tab === "selling" ? selling : tab === "reserved" ? reserved : sold;
        target.reset({ products: nextProducts, cursor: keepCursor });
      };

      const lists = {
        selling: selling.products,
        reserved: reserved.products,
        sold: sold.products,
      };

      const fromList = lists[from].filter((p) => p.id !== product.id);
      const toList = [
        nextProduct,
        ...lists[to].filter((p) => p.id !== product.id),
      ].filter((p, i, arr) => arr.findIndex((x) => x.id === p.id) === i); // 중복 제거

      resetByTab(
        from,
        fromList,
        (from === "selling"
          ? snap.selling
          : from === "reserved"
            ? snap.reserved
            : snap.sold
        ).cursor
      );
      resetByTab(
        to,
        toList,
        (to === "selling"
          ? snap.selling
          : to === "reserved"
            ? snap.reserved
            : snap.sold
        ).cursor
      );

      setCounts((c) => ({
        ...c,
        [from]: Math.max(0, c[from] - 1),
        [to]: c[to] + 1,
      }));

      const rollback = () => {
        selling.reset(snap.selling);
        reserved.reset(snap.reserved);
        sold.reset(snap.sold);
        setCounts(snap.counts);
      };
      return rollback;
    },
    [selling, reserved, sold, counts]
  );

  // 서버 실패 시 보수적 보정(필요 탭만 새로고침)
  const onMoveFailed = useCallback(
    async ({ from, to }: { from: Tab; to: Tab }) => {
      await Promise.all([refreshTab(from), refreshTab(to)]);
    },
    [refreshTab]
  );

  // 현재 탭 파생값
  const current =
    activeTab === "selling"
      ? selling
      : activeTab === "reserved"
        ? reserved
        : sold;
  const currentProducts = current.products as MySalesListItem[];

  //  아이템에서 올라온 변경을 현재 탭 훅에 부분 반영
  const applyPatchToCurrent = (id: number, patch: Partial<MySalesListItem>) => {
    if (activeTab === "selling") selling.updateOne(id, patch);
    else if (activeTab === "reserved") reserved.updateOne(id, patch);
    else sold.updateOne(id, patch);
  };

  // 무한스크롤 트리거
  const triggerRef = useRef<HTMLButtonElement>(null);
  const isVisible = usePageVisibility();

  useInfiniteScroll({
    triggerRef,
    hasMore: current.hasMore,
    isLoading: current.isLoading,
    onLoadMore: current.loadMore,
    enabled: isVisible,
    rootMargin: "1000px 0px 0px 0px",
    threshold: 0.01,
  });

  return (
    <div className="w-full mx-auto max-w-3xl flex flex-col gap-6 px-4 py-6 sm:px-5 lg:px-6">
      {/* 탭 메뉴 */}
      <div
        className="flex justify-center space-x-4 mb-4"
        role="tablist"
        aria-label="판매 상태 탭"
      >
        <button
          id="tab-selling"
          role="tab"
          aria-selected={activeTab === "selling"}
          aria-controls="panel-selling"
          onClick={() => setActiveTab("selling")}
          className={`px-6 py-2.5 rounded-lg font-medium transition-colors ${
            activeTab === "selling"
              ? "bg-primary text-white dark:bg-primary-light"
              : "bg-neutral-100 hover:bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:hover:bg-neutral-700 dark:text-neutral-300"
          }`}
        >
          판매 중 ({counts.selling})
        </button>

        <button
          id="tab-reserved"
          role="tab"
          aria-selected={activeTab === "reserved"}
          aria-controls="panel-reserved"
          onClick={() => setActiveTab("reserved")}
          className={`px-6 py-2.5 rounded-lg font-medium transition-colors ${
            activeTab === "reserved"
              ? "bg-primary text-white dark:bg-primary-light"
              : "bg-neutral-100 hover:bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:hover:bg-neutral-700 dark:text-neutral-300"
          }`}
        >
          예약 중 ({counts.reserved})
        </button>

        <button
          id="tab-sold"
          role="tab"
          aria-selected={activeTab === "sold"}
          aria-controls="panel-sold"
          onClick={() => setActiveTab("sold")}
          className={`px-6 py-2.5 rounded-lg font-medium transition-colors ${
            activeTab === "sold"
              ? "bg-primary text-white dark:bg-primary-light"
              : "bg-neutral-100 hover:bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:hover:bg-neutral-700 dark:text-neutral-300"
          }`}
        >
          판매 완료 ({counts.sold})
        </button>
      </div>

      {/* 제품 리스트 */}
      <div
        id={`panel-${activeTab}`}
        role="tabpanel"
        aria-labelledby={`tab-${activeTab}`}
        className="flex flex-col gap-6 px-1.5 sm:px-0"
      >
        {currentProducts.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-neutral-500 dark:text-neutral-400">
              {activeTab === "selling" && "판매 중인 제품이 없습니다."}
              {activeTab === "reserved" &&
                (reservedLoaded
                  ? "예약 중인 제품이 없습니다."
                  : "불러오는 중…")}
              {activeTab === "sold" &&
                (soldLoaded ? "판매 완료된 제품이 없습니다." : "불러오는 중…")}
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {currentProducts.map((product) => (
                <MySalesProductItem
                  key={product.id}
                  product={product}
                  type={activeTab}
                  userId={userId}
                  onOptimisticMove={onOptimisticMove}
                  onMoveFailed={onMoveFailed}
                  onReviewChanged={(patch) =>
                    applyPatchToCurrent(product.id, patch)
                  }
                />
              ))}
            </div>

            {current.hasMore && (
              <button
                ref={triggerRef}
                type="button"
                className="mb-40 text-sm font-medium bg-primary/10 dark:bg-primary-light/10 text-primary dark:text-primary-light w-fit mx-auto px-4 py-2 rounded-full hover:bg-primary/20 dark:hover:bg-primary-light/20 active:scale-95 transition-all flex items-center gap-2"
                aria-busy={current.isLoading}
                aria-controls={`panel-${activeTab}`}
              >
                {current.isLoading ? (
                  <>
                    <span className="animate-spin" aria-hidden>
                      🌊
                    </span>{" "}
                    항해중...
                  </>
                ) : (
                  <>
                    <span aria-hidden>⚓</span> 더 보기
                  </>
                )}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
