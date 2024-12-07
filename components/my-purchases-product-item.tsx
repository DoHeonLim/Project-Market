/**
File Name : components/my-purchases-product-item
Description : 프로필 나의 구매 제품 아이템 컴포넌트
Author : 임도헌

History
Date        Author   Status    Description
2024.12.03  임도헌   Created
2024.12.03  임도헌   Modified  나의 구매 제품 아이템 컴포넌트 추가
2024.12.03  임도헌   Modified  거래 후기 작성 모달 추가
2024.12.03  임도헌   Modified  구매자, 판매자 리뷰 모달 추가
2024.12.03  임도헌   Modified  로딩 및 에러 처리 추가
*/

"use client";

import { formatToTimeAgo, formatToWon } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import CreateReviewModal from "./modals/create-review-modal";
import { useReview } from "@/hooks/useReview";
import { deleteReview } from "@/app/(tabs)/profile/(product)/my-purchases/actions";
import ReviewDetailModal from "./modals/review-detail-modal";

interface ProductItemProps {
  product: {
    user: {
      username: string;
      avatar: string | null;
    };
    id: number;
    title: string;
    price: number;
    photo: string;
    purchase_userId: number | null;
    purchased_at: Date | null;
    reviews: {
      id: number;
      userId: number;
      productId: number;
      payload: string;
      rate: number;
    }[];
  };
}

export default function MyPurchasesProductItem({ product }: ProductItemProps) {
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isBuyerReviewModalOpen, setIsBuyerReviewModalOpen] = useState(false);
  const [isSellerReviewModalOpen, setIsSellerReviewModalOpen] = useState(false);

  const { isLoading, error, submitReview } = useReview({
    productId: product.id,
    userId: product.purchase_userId!,
    type: "buyer",
  });

  // 구매자와 판매자 리뷰를 분리
  const buyerReviews = product.reviews.filter(
    (review) => review.userId === product.purchase_userId
  );

  const sellerReviews = product.reviews.filter(
    (review) => review.userId !== product.purchase_userId
  );

  const handleSubmitReview = async (text: string, rating: number) => {
    await submitReview(text, rating);
    if (!error) {
      setIsReviewModalOpen(false);
    }
  };

  const handleDeleteReview = async () => {
    try {
      if (!buyerReviews[0]?.id) return;

      const confirmed = confirm("리뷰를 삭제하시겠습니까?");
      if (!confirmed) return;

      await deleteReview(buyerReviews[0].id, "buyer");
      setIsBuyerReviewModalOpen(false);
    } catch (error) {
      console.error("리뷰 삭제 중 오류 발생:", error);
      alert("리뷰 삭제 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <Link
        href={`/products/${product.id}`}
        className="flex gap-5 transition-colors hover:bg-neutral-600 rounded-xl"
      >
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
            판매 날짜 : {formatToTimeAgo(product.purchased_at!.toString())}
          </span>
          <span className="text-lg font-semibold">
            {formatToWon(product.price)}원
          </span>
        </div>
      </Link>

      <div className="flex justify-center gap-8">
        {buyerReviews.length > 0 ? (
          <button
            onClick={() => setIsBuyerReviewModalOpen(true)}
            className="px-4 py-2 font-semibold transition-colors bg-blue-600 rounded-md hover:bg-blue-400"
          >
            내가 쓴 리뷰 보기
          </button>
        ) : (
          <button
            onClick={() => setIsReviewModalOpen(true)}
            className="px-5 py-2.5 font-semibold bg-indigo-600 rounded-md hover:bg-indigo-400 transition-colors"
          >
            거래 후기 보내기
          </button>
        )}

        <button
          onClick={() => setIsSellerReviewModalOpen(true)}
          className="px-4 py-2 font-semibold transition-colors bg-green-600 rounded-md hover:bg-green-400"
        >
          {product.user.username} 님의 리뷰 보기
        </button>
      </div>

      {error && (
        <div className="p-4 text-white bg-red-500 rounded-md">{error}</div>
      )}

      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="p-4 text-white bg-neutral-800 rounded-md">
            리뷰를 등록하는 중...
          </div>
        </div>
      )}

      <CreateReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        onSubmit={handleSubmitReview}
        username={product.user.username}
        userAvatar={product.user.avatar}
      />

      {/* 구매자 리뷰 모달 */}
      <ReviewDetailModal
        isOpen={isBuyerReviewModalOpen}
        onClose={() => setIsBuyerReviewModalOpen(false)}
        title="내가 쓴 리뷰"
        review={buyerReviews[0]}
        onDelete={handleDeleteReview}
      />

      {/* 판매자 리뷰 모달 */}
      <ReviewDetailModal
        isOpen={isSellerReviewModalOpen}
        onClose={() => setIsSellerReviewModalOpen(false)}
        title={`${product.user.username}님의 리뷰`}
        review={sellerReviews[0]}
        emptyMessage={`${product.user.username}님이 아직 리뷰를 보내지 않았습니다.`}
      />
    </div>
  );
}
