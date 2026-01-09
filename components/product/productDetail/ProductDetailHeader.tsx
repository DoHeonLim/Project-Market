/**
File Name : components/productDetail/ProductDetailHeader
Description : 제품 상세 제목, 가격, 게임유형 표시 컴포넌트
Author : 임도헌

History
Date        Author   Status    Description
2025.06.08  임도헌   Created   제품 제목/가격/게임 유형 태그 분리
*/

"use client";

import { formatToWon } from "@/lib/utils";
import { GAME_TYPE_DISPLAY } from "@/lib/constants";
import Link from "next/link";

interface ProductDetailHeaderProps {
  title: string;
  price: number;
  game_type: string;
}

export default function ProductDetailHeader({
  title,
  price,
  game_type,
}: ProductDetailHeaderProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <Link
          href={`/products?game_type=${game_type}`}
          className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-primary/10 text-primary dark:bg-primary-light/10 dark:text-primary-light rounded-full hover:bg-primary/20 dark:hover:bg-primary-light/20 transition-all hover:scale-105 active:scale-95"
        >
          🎲 {GAME_TYPE_DISPLAY[game_type as keyof typeof GAME_TYPE_DISPLAY]}
        </Link>
      </div>
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-text dark:text-text-dark">
          🎲 {title}
        </h1>
        <span className="text-lg font-bold text-accent dark:text-accent-light">
          💰 {formatToWon(price)}원
        </span>
      </div>
    </div>
  );
}
