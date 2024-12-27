/**
File Name : components/product-list
Description : 제품 컴포넌트
Author : 임도헌

History
Date        Author   Status    Description
2024.10.14  임도헌   Created
2024.10.14  임도헌   Modified  제품 컴포넌트 추가
2024.10.17  임도헌   Modified  무한 스크롤 기능 추가
2024.12.12  임도헌   Modified  스타일 수정
2024.12.17  임도헌   Modified  스타일 수정
2024.12.24  임도헌   Modified  스타일 재 수정
*/
"use client";

import { InitialProducts } from "@/app/(tabs)/products/page";
import ListProduct from "./list-product";
import { useEffect, useRef, useState } from "react";
import { getMoreProducts } from "@/app/(tabs)/products/actions";

interface IProductListProps {
  initialProducts: InitialProducts;
}

export default function ProductList({ initialProducts }: IProductListProps) {
  const [products, setProducts] = useState(initialProducts);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [isLastPage, setIsLastPage] = useState(false);
  const trigger = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      async (
        entries: IntersectionObserverEntry[],
        observer: IntersectionObserver
      ) => {
        const element = entries[0];
        if (element.isIntersecting && trigger.current) {
          observer.unobserve(trigger.current);
          setIsLoading(true);
          const newProducts = await getMoreProducts(page + 1);
          if (newProducts.length !== 0) {
            setProducts((prev) => [...prev, ...newProducts]);
            setPage((prev) => prev + 1);
            setIsLoading(false);
          } else {
            setIsLastPage(true);
          }
        }
      },
      {
        threshold: 1.0,
      }
    );
    if (trigger.current) {
      observer.observe(trigger.current);
    }
    return () => {
      observer.disconnect();
    };
  }, [page]);

  return (
    <div className="flex flex-col gap-6 p-4">
      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 p-8 text-text/80 dark:text-text-dark/80">
          <span className="text-4xl">🌊</span>
          <p className="text-lg font-medium text-center">
            아직 항해중인 보드게임이 없습니다
          </p>
          <p className="text-sm text-center">
            첫 번째 보드게임을 등록하고 새로운 항해를 시작해보세요!
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-6">
            {products.map((product) => (
              <ListProduct key={product.id} {...product} />
            ))}
          </div>

          {!isLastPage && (
            <span
              ref={trigger}
              className="mb-96 text-sm font-medium bg-primary dark:bg-primary-light text-white dark:text-text-dark w-fit mx-auto px-4 py-2 rounded-md hover:bg-primary/90 dark:hover:bg-primary-light/90 active:scale-95 transition-all cursor-pointer flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <span className="animate-spin">🌊</span>
                  항해중...
                </>
              ) : (
                <>
                  <span>⚓</span>더 많은 보드게임 찾기
                </>
              )}
            </span>
          )}
        </>
      )}
    </div>
  );
}
