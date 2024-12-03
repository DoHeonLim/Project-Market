/**
File Name : components/my-salse-product-list
Description : 나의 판매 제품 리스트 컴포넌트
Author : 임도헌

History
Date        Author   Status    Description
2024.11.30  임도헌   Created
2024.11.30  임도헌   Modified  나의 판매 제품 리스트 컴포넌트
2024.12.03  임도헌   Modified  purchase_at을 purchased_at으로 변경
*/
"use client";

import { useState } from "react";
import MySalesProductItem from "./my-sales-product-item";

type ProductType = {
  id: number;
  title: string;
  price: number;
  description: string;
  photo: string;
  created_at: Date;
  updated_at: Date;
  userId: number;
  reservation_at?: Date | null;
  purchased_at?: Date | null;
};

interface ISellingProductList {
  products: ProductType[];
}

export default function MySalesProductList({ products }: ISellingProductList) {
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
      <h1 className="text-2xl flex justify-center items-center">판매 제품</h1>
      {/* 탭 메뉴 */}
      <div className="flex justify-center space-x-4 mb-4">
        <button
          onClick={() => setActiveTab("selling")}
          className={`px-4 py-2 rounded ${
            activeTab === "selling"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          판매 중 ({sellingProducts.length})
        </button>
        <button
          onClick={() => setActiveTab("reserved")}
          className={`px-4 py-2 rounded ${
            activeTab === "reserved"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          예약 중 ({reservedProducts.length})
        </button>
        <button
          onClick={() => setActiveTab("sold")}
          className={`px-4 py-2 rounded ${
            activeTab === "sold"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          판매 완료 ({soldProducts.length})
        </button>
      </div>

      {/* 제품 리스트 */}
      <div className="flex flex-col gap-6">
        {currentProducts.length === 0 ? (
          <p className="text-center text-gray-500">
            {activeTab === "selling" && "판매 중인 제품이 없습니다."}
            {activeTab === "reserved" && "예약 중인 제품이 없습니다."}
            {activeTab === "sold" && "판매 완료된 제품이 없습니다."}
          </p>
        ) : (
          currentProducts.map((product) => (
            <MySalesProductItem
              key={product.id}
              product={product}
              type={activeTab}
            />
          ))
        )}
      </div>
    </div>
  );
}
