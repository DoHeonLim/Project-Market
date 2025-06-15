/**
File Name : components/productDetail/ProductDetailTags
Description : 제품 상세 태그 리스트 컴포넌트
Author : 임도헌

History
Date        Author   Status    Description
2025.06.08  임도헌   Created   제품 태그 컴포넌트 분리
*/

"use client";

import Link from "next/link";

interface ProductDetailTagsProps {
  tags: { name: string }[];
}

export default function ProductDetailTags({ tags }: ProductDetailTagsProps) {
  if (tags.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 py-4 border-y dark:border-neutral-700">
      {tags.map((tag, index) => (
        <Link
          key={index}
          href={`/products?keyword=${tag.name}`}
          className="px-3 py-1 text-sm bg-primary/10 text-primary dark:bg-primary-light/10 dark:text-primary-light rounded-full hover:bg-primary/20 dark:hover:bg-primary-light/20 transition-colors"
        >
          🏷️ {tag.name}
        </Link>
      ))}
    </div>
  );
}
