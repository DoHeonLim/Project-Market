/**
File Name : components/product/MyPurchasesProductItem
Description : 프로필 나의 구매 제품 아이템 컴포넌트
Author : 임도헌

History
Date        Author   Status    Description
2024.12.03  임도헌   Created
2024.12.03  임도헌   Modified  나의 구매 제품 아이템 컴포넌트 추가
2024.12.03  임도헌   Modified  거래 후기 작성 모달 추가
2024.12.03  임도헌   Modified  구매자, 판매자 리뷰 모달 추가
2024.12.03  임도헌   Modified  로딩 및 에러 처리 추가
2024.12.12  임도헌   Modified  photo속성에서 images로 변경
2024.12.12  임도헌   Modified  제품 상태 변경 시간 표시 변경
2024.12.22  임도헌   Modified  오타 수정
2024.12.24  임도헌   Modified  다크모드 적용
2024.12.29  임도헌   Modified  나의 구매 제품 아이템 컴포넌트 스타일 수정
*/

"use client";

import { formatToWon } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import CreateReviewModal from "../profile/CreateReviewModal";
import { useReview } from "@/hooks/useReview";
import { deleteReview } from "@/app/(tabs)/profile/(product)/my-purchases/actions";
import ReviewDetailModal from "../profile/ReviewDetailModal";
import TimeAgo from "../common/TimeAgo";

interface ProductItemProps {
  product: {
    user: {
      username: string;
      avatar: string | null;
    };
    id: number;
    title: string;
    price: number;
    images: {
      url: string;
    }[];
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
    <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 transition-all">
      <Link
        href={`/products/${product.id}`}
        className="flex gap-5 transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-700/50 rounded-lg p-2 -m-2"
      >
        <div className="relative overflow-hidden rounded-lg size-28 border border-neutral-200 dark:border-neutral-700">
          <Image
            fill
            src={`${product.images[0]?.url}/avatar`}
            sizes="(max-width: 768px) 112px, 112px"
            className="object-cover hover:scale-110 transition-transform duration-200"
            alt={product.title}
          />
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-lg font-medium text-neutral-900 dark:text-white">
            {product.title}
          </span>
          <span className="text-sm text-neutral-500 dark:text-neutral-400">
            판매 날짜 : <TimeAgo date={product.purchased_at!.toString()} />
          </span>
          <span className="text-lg font-semibold text-primary dark:text-primary-light">
            {formatToWon(product.price)}원
          </span>
        </div>
      </Link>

      <div className="flex justify-center gap-4 mt-6">
        {buyerReviews.length > 0 ? (
          <button
            onClick={() => setIsBuyerReviewModalOpen(true)}
            className="btn-primary flex-1 max-w-[200px] py-2.5"
          >
            내가 쓴 리뷰 보기
          </button>
        ) : (
          <button
            onClick={() => setIsReviewModalOpen(true)}
            className="btn-primary flex-1 max-w-[200px] py-2.5"
          >
            거래 후기 보내기
          </button>
        )}

        <button
          onClick={() => setIsSellerReviewModalOpen(true)}
          className="btn-primary flex-1 max-w-[200px] py-2.5"
        >
          {product.user.username} 님의 리뷰 보기
        </button>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">
          {error}
        </div>
      )}

      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="p-4 bg-white dark:bg-neutral-800 rounded-lg shadow-xl">
            <span className="text-neutral-900 dark:text-white">
              리뷰를 등록하는 중...
            </span>
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
