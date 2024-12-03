/**
File Name : components/my-salse-product-item
Description : 나의 판매 제품 상세 컴포넌트
Author : 임도헌

History
Date        Author   Status    Description
2024.11.30  임도헌   Created
2024.11.30  임도헌   Modified  나의 판매 제품 상세 컴포넌트 추가
2024.12.03  임도헌   Modified  purchase_at을 purchased_at으로 변경
*/
import Image from "next/image";
import Link from "next/link";
import { formatToTimeAgo, formatToWon } from "@/lib/utils";
import { useState } from "react";
import { SelectUserModal } from "./select-user-modal";
import { updateProductStatus } from "@/app/(tabs)/profile/(product)/my-sales/actions";

interface ProductItemProps {
  product: {
    id: number;
    title: string;
    price: number;
    photo: string;
    created_at: Date;
    reservation_at?: Date | null;
    purchased_at?: Date | null;
  };
  type?: "selling" | "reserved" | "sold";
}

export default function MySalesProductItem({
  product,
  type,
}: ProductItemProps) {
  const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);

  const handleUpdateToSold = async () => {
    await updateProductStatus(product.id, "sold");
    alert("판매 완료로 변경되었습니다.");
  };

  const handleUpdateToSelling = async () => {
    await updateProductStatus(product.id, "selling");
    alert("판매 중으로 변경되었습니다.");
  };

  return (
    <div>
      <Link href={`/products/${product.id}`} className="flex gap-5">
        <div className="relative overflow-hidden rounded-md size-28">
          <Image
            fill
            src={`${product.photo}/avatar`}
            sizes="(max-width: 768px) 112px, 112px"
            className="object-cover"
            alt={product.title}
          />
        </div>
        <div className="flex flex-col gap-1 *:text-white">
          <span className="text-lg">{product.title}</span>
          <span className="text-sm text-neutral-500">
            {formatToTimeAgo(product.created_at.toString())}
          </span>
          <span className="text-lg font-semibold">
            {formatToWon(product.price)}원
          </span>

          {type === "reserved" &&
            product.reservation_at &&
            !product.purchased_at && (
              <span className="text-sm text-yellow-500">
                예약일: {formatToTimeAgo(product.reservation_at.toString())}
              </span>
            )}

          {type === "sold" && product.purchased_at && (
            <span className="text-sm text-green-500">
              판매일: {formatToTimeAgo(product.purchased_at.toString())}
            </span>
          )}
        </div>
      </Link>
      <div className="flex gap-6 my-6">
        {(type === "sold" || type === "reserved") && (
          <button
            onClick={handleUpdateToSelling}
            className="px-5 py-2.5 font-semibold bg-indigo-600 rounded-md hover:bg-indigo-400 transition-colors"
          >
            판매중으로 변경
          </button>
        )}
        {type === "selling" && (
          <button
            className="px-5 py-2.5 font-semibold bg-indigo-600 rounded-md hover:bg-indigo-400 transition-colors"
            onClick={() => setIsReservationModalOpen(true)}
          >
            예약자 선택
          </button>
        )}
        {type === "reserved" && (
          <button
            onClick={handleUpdateToSold}
            className="px-5 py-2.5 font-semibold bg-indigo-600 rounded-md hover:bg-indigo-400 transition-colors"
          >
            판매완료로 변경
          </button>
        )}
      </div>
      <SelectUserModal
        productId={product.id}
        isOpen={isReservationModalOpen}
        onOpenChange={setIsReservationModalOpen}
      />
    </div>
  );
}
