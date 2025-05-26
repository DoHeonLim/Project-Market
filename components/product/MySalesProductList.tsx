/**
File Name : components/product/MySalseProductList
Description : 나의 판매 제품 리스트 컴포넌트
Author : 임도헌

History
Date        Author   Status    Description
2024.11.30  임도헌   Created
2024.11.30  임도헌   Modified  나의 판매 제품 리스트 컴포넌트
2024.12.03  임도헌   Modified  purchase_at을 purchased_at으로 변경
2024.12.12  임도헌   Modified  photo속성에서 images로 변경
2024.12.24  임도헌   Modified  다크모드 적용
*/
"use client";

import { useState } from "react";
import MySalesProductItem from "./MySalesProductItem";

type ProductType = {
  id: number;
  title: string;
  price: number;
  images: {
    url: string;
  }[];
  created_at: Date;
  updated_at: Date;
  reservation_userId: number | null;
  reservation_at: Date | null;
  purchase_userId: number | null;
  purchased_at: Date | null;
  user: {
    username: string;
    avatar: string | null;
  };
  reviews: {
    id: number;
    userId: number;
    productId: number;
    payload: string;
    rate: number;
  }[];
};

interface ISellingProductList {
  products: ProductType[];
  userId: number;
}

export default function MySalesProductList({
  products,
  userId,
}: ISellingProductList) {
  const [activeTab, setActiveTab] = useState<"selling" | "reserved" | "sold">(
    "selling"
  );

  // 제품 상태별 필터링
  const sellingProducts = products.filter(
    (product) => !product.reservation_at && !product.purchased_at
  );

  const reservedProducts = products.filter(
    (product) => product.reservation_at && !product.purchased_at
  );

  const soldProducts = products.filter((product) => product.purchased_at);

  // 현재 선택된 탭의 제품 리스트
  const currentProducts =
    activeTab === "selling"
      ? sellingProducts
      : activeTab === "reserved"
        ? reservedProducts
        : soldProducts;

  return (
    <div className="w-full flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-center text-primary dark:text-primary-light">
        판매 제품
      </h1>

      {/* 탭 메뉴 */}
      <div className="flex justify-center space-x-4 mb-4">
        <button
          onClick={() => setActiveTab("selling")}
          className={`px-6 py-2.5 rounded-lg font-medium transition-colors ${
            activeTab === "selling"
              ? "bg-primary text-white dark:bg-primary-light"
              : "bg-neutral-100 hover:bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:hover:bg-neutral-700 dark:text-neutral-300"
          }`}
        >
          판매 중 ({sellingProducts.length})
        </button>
        <button
          onClick={() => setActiveTab("reserved")}
          className={`px-6 py-2.5 rounded-lg font-medium transition-colors ${
            activeTab === "reserved"
              ? "bg-primary text-white dark:bg-primary-light"
              : "bg-neutral-100 hover:bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:hover:bg-neutral-700 dark:text-neutral-300"
          }`}
        >
          예약 중 ({reservedProducts.length})
        </button>
        <button
          onClick={() => setActiveTab("sold")}
          className={`px-6 py-2.5 rounded-lg font-medium transition-colors ${
            activeTab === "sold"
              ? "bg-primary text-white dark:bg-primary-light"
              : "bg-neutral-100 hover:bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:hover:bg-neutral-700 dark:text-neutral-300"
          }`}
        >
          판매 완료 ({soldProducts.length})
        </button>
      </div>

      {/* 제품 리스트 */}
      <div className="flex flex-col gap-6">
        {currentProducts.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-neutral-500 dark:text-neutral-400">
              {activeTab === "selling" && "판매 중인 제품이 없습니다."}
              {activeTab === "reserved" && "예약 중인 제품이 없습니다."}
              {activeTab === "sold" && "판매 완료된 제품이 없습니다."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {currentProducts.map((product) => (
              <MySalesProductItem
                key={product.id}
                product={product}
                type={activeTab}
                userId={userId}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
