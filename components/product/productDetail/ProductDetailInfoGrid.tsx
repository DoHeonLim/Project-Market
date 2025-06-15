/**
File Name : components/productDetail/ProductDetailInfoGrid
Description : 제품 상세 상태 정보 그리드 컴포넌트
Author : 임도헌

History
Date        Author   Status    Description
2025.06.08  임도헌   Created   제품 상태/구성 정보 그리드 분리
*/

"use client";

import ProductInfoItem from "@/components/product/ProductInfoItem";
import { CONDITION_DISPLAY, COMPLETENESS_DISPLAY } from "@/lib/constants";

interface ProductDetailInfoGridProps {
  category: {
    eng_name: string;
    kor_name: string;
    icon: string | null;
    parent?: {
      eng_name: string;
      kor_name: string;
      icon: string | null;
    } | null;
  };
  min_players: number;
  max_players: number;
  play_time: string;
  condition: string;
  completeness: string;
  has_manual: boolean;
}

export default function ProductDetailInfoGrid({
  category,
  min_players,
  max_players,
  play_time,
  condition,
  completeness,
  has_manual,
}: ProductDetailInfoGridProps) {
  return (
    <div className="grid grid-cols-2 gap-4 p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg border border-neutral-200 dark:border-neutral-700">
      <ProductInfoItem
        label="📁 카테고리"
        value={
          <span className="flex items-center gap-2">
            {category.parent && (
              <>
                <span>
                  {category.parent.icon} {category.parent.kor_name}
                </span>
                <span className="text-neutral-400">&gt;</span>
              </>
            )}
            <span>
              {category.icon} {category.kor_name}
            </span>
          </span>
        }
      />
      <ProductInfoItem
        label="🎮 게임 인원"
        value={`${min_players} - ${max_players}명`}
      />
      <ProductInfoItem label="⌛ 플레이 시간" value={play_time} />
      <ProductInfoItem
        label="📦 제품 상태"
        value={CONDITION_DISPLAY[condition as keyof typeof CONDITION_DISPLAY]}
      />
      <ProductInfoItem
        label="🧩 구성품 상태"
        value={
          COMPLETENESS_DISPLAY[
            completeness as keyof typeof COMPLETENESS_DISPLAY
          ]
        }
      />
      <ProductInfoItem
        label="📖 설명서"
        value={has_manual ? "✅ 포함" : "❌ 미포함"}
      />
    </div>
  );
}
