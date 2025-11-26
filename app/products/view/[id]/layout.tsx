/**
 * File Name : app/products/view/[id]/layout
 * Description : 제품 상세 상단바 레이아웃(뒤로가기 + 카테고리 칩 + (소유자) 편집)
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2025.11.13  임도헌   Created   제품 상세 전용 상단바 도입
 */

import type { ReactNode } from "react";
import Link from "next/link";
import BackButton from "@/components/common/BackButton";
import { getProductTopbar } from "@/lib/product/getProductTopbar";

export default async function ProductDetailLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: { id: string };
}) {
  const id = Number(params.id);
  const { categoryId, categoryLabel, categoryIcon, isOwner } =
    await getProductTopbar(id);

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-900">
      <header
        className="sticky top-0 z-40 h-12 sm:h-14
                   backdrop-blur-md bg-white/70 dark:bg-neutral-900/70
                   border-b border-neutral-200/70 dark:border-neutral-800
                   px-2 sm:px-4"
        role="banner"
      >
        <div className="mx-auto max-w-4xl h-full flex items-center gap-2">
          <BackButton fallbackHref="/products" />
          {/* 가운데 여백 */}
          <div className="flex-1" />
          {/* 카테고리 칩 */}
          {categoryId && categoryLabel && (
            <Link
              href={`/products?category=${encodeURIComponent(String(categoryId))}`}
              className="px-3 py-1.5 text-xs sm:text-sm font-medium text-white 
               rounded-full bg-primary/80 dark:bg-primary-light/80 
               hover:bg-primary dark:hover:bg-primary-light transition-colors"
              aria-label={`카테고리 ${categoryLabel}로 보기`}
            >
              {categoryIcon}
              {categoryLabel}
            </Link>
          )}
          {/* 소유자면 편집 */}
          {isOwner && (
            <Link
              href={`/products/edit/${id}`}
              className="ml-2 hidden sm:inline-flex items-center px-3 py-1.5
                         text-xs sm:text-sm font-medium rounded-md
                         bg-neutral-900 text-white dark:bg-white dark:text-neutral-900
                         hover:opacity-90 transition"
            >
              수정
            </Link>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-4xl">{children}</main>
    </div>
  );
}
