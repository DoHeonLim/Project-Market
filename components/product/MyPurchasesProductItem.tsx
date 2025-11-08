/**
 * File Name : components/product/MyPurchasesProductItem
 * Description : 프로필 나의 구매 제품 아이템 컴포넌트
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2024.12.03  임도헌   Created
 * 2024.12.03  임도헌   Modified  나의 구매 제품 아이템 컴포넌트 추가
 * 2024.12.03  임도헌   Modified  거래 후기 작성 모달 추가
 * 2024.12.03  임도헌   Modified  구매자, 판매자 리뷰 모달 추가
 * 2024.12.03  임도헌   Modified  로딩 및 에러 처리 추가
 * 2024.12.12  임도헌   Modified  photo속성에서 images로 변경
 * 2024.12.12  임도헌   Modified  제품 상태 변경 시간 표시 변경
 * 2024.12.22  임도헌   Modified  오타 수정
 * 2024.12.24  임도헌   Modified  다크모드 적용
 * 2024.12.29  임도헌   Modified  나의 구매 제품 아이템 컴포넌트 스타일 수정
 * 2025.10.17  임도헌   Modified  lib/review 경로로 교체, /products/view 경로 통일, 이미지 /public
 * 2025.11.02  임도헌   Modified  썸네일 안전화(빈 src 방지 + 스켈레톤), TimeAgo 타입 안전화, a11y 라벨 보강
 * 2025.11.06  임도헌   Modified  ConfirmDialog로 리뷰 삭제 일원화 + 삭제 로딩/닫힘 제어 + onReviewChanged 유지
 */

"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { formatToWon } from "@/lib/utils";
import TimeAgo from "../common/TimeAgo";
import CreateReviewModal from "../profile/CreateReviewModal";
import ReviewDetailModal from "../profile/ReviewDetailModal";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import { useReview } from "@/hooks/useReview";
import { deleteReview } from "@/lib/review/deleteReview";
import type { MyPurchasedListItem } from "@/types/product";

type Props = {
  product: MyPurchasedListItem;
  onReviewChanged?: (patch: Partial<MyPurchasedListItem>) => void;
};

// 로컬 헬퍼: /public 접미어 통일 적용
function getPublicImageUrl(url?: string | null) {
  if (!url) return null;
  return url.endsWith("/public") ? url : `${url}/public`;
}

export default function MyPurchasesProductItem({
  product,
  onReviewChanged,
}: Props) {
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isBuyerReviewModalOpen, setIsBuyerReviewModalOpen] = useState(false);
  const [isSellerReviewModalOpen, setIsSellerReviewModalOpen] = useState(false);

  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { isLoading, error, submitReview } = useReview({
    productId: product.id,
    type: "buyer",
    onSuccess: (newReview) => {
      const nextReviews = [
        newReview,
        ...allReviews.filter((r) => r.userId !== product.purchase_userId),
      ];
      setIsReviewModalOpen(false);
      onReviewChanged?.({ reviews: nextReviews });
    },
  });

  const allReviews = product.reviews ?? [];
  const buyerReview = allReviews.find(
    (r) => r.userId === product.purchase_userId
  );
  const sellerReview = allReviews.find(
    (r) => r.userId !== product.purchase_userId
  );

  const handleSubmitReview = async (
    text: string,
    rating: number
  ): Promise<boolean> => {
    const res = await submitReview(text, rating);
    return res.ok;
  };

  // 삭제 버튼 클릭 → 확인 모달 오픈
  const handleDeleteReview = () => {
    if (!buyerReview?.id) return;
    setIsDeleteConfirmOpen(true);
  };

  // 확인 모달에서 실제 삭제 실행
  const confirmDeleteReview = async () => {
    const reviewId = buyerReview?.id;
    if (!reviewId) {
      setIsDeleteConfirmOpen(false);
      return;
    }
    try {
      setIsDeleting(true);
      await deleteReview(reviewId);
      setIsBuyerReviewModalOpen(false);
      const nextReviews = allReviews.filter((r) => r.id !== reviewId);
      onReviewChanged?.({ reviews: nextReviews });
    } catch (e) {
      console.error("리뷰 삭제 중 오류 발생:", e);
      // 이 컴포넌트는 토스트 대신 경고창을 쓰던 컨벤션이었으나,
      // ConfirmDialog로 일원화되었으므로 추가 alert는 제거
    } finally {
      setIsDeleting(false);
      setIsDeleteConfirmOpen(false);
    }
  };

  const purchasedAt = product.purchased_at
    ? new Date(product.purchased_at)
    : undefined;
  const sellerName = product.user?.username ?? "판매자";
  const sellerAvatar = product.user?.avatar ?? null;

  const href = `/products/view/${product.id}`;
  const thumbUrl = getPublicImageUrl(product.images?.[0]?.url);

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 transition-all">
      <Link
        href={href}
        className="flex gap-5 transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-700/50 rounded-lg p-2 -m-2"
      >
        <div className="relative overflow-hidden rounded-lg size-28 border border-neutral-200 dark:border-neutral-700">
          {thumbUrl ? (
            <Image
              fill
              src={thumbUrl}
              sizes="(max-width: 768px) 112px, 112px"
              className="object-cover hover:scale-110 transition-transform duration-200"
              alt={`${product.title} 썸네일`}
            />
          ) : (
            <div className="absolute inset-0 bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
          )}
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-lg font-medium text-neutral-900 dark:text-white">
            {product.title}
          </span>

          {purchasedAt && (
            <span className="text-sm text-neutral-500 dark:text-neutral-400">
              판매 날짜 : <TimeAgo date={purchasedAt} />
            </span>
          )}

          <span className="text-lg font-semibold text-primary dark:text-primary-light">
            {formatToWon(product.price)}원
          </span>
        </div>
      </Link>

      <div className="flex justify-center gap-4 mt-6">
        {buyerReview ? (
          <button
            onClick={() => setIsBuyerReviewModalOpen(true)}
            className="btn-primary flex-1 max-w-[200px] py-2.5"
            disabled={isLoading}
          >
            내가 쓴 리뷰 보기
          </button>
        ) : (
          <button
            onClick={() => setIsReviewModalOpen(true)}
            className="btn-primary flex-1 max-w-[200px] py-2.5"
            disabled={isLoading}
          >
            거래 후기 보내기
          </button>
        )}

        <button
          onClick={() => setIsSellerReviewModalOpen(true)}
          className="btn-primary flex-1 max-w-[200px] py-2.5"
          disabled={isLoading}
        >
          {sellerName} 님의 리뷰 보기
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

      {/* 리뷰 작성 모달 (구매자) */}
      <CreateReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        onSubmit={handleSubmitReview}
        username={sellerName}
        userAvatar={sellerAvatar}
      />

      {/* 내가 쓴 리뷰(구매자) */}
      <ReviewDetailModal
        isOpen={isBuyerReviewModalOpen}
        onClose={() => setIsBuyerReviewModalOpen(false)}
        title="내가 쓴 리뷰"
        review={buyerReview}
        onDelete={handleDeleteReview}
      />

      {/* 판매자가 남긴 리뷰 */}
      <ReviewDetailModal
        isOpen={isSellerReviewModalOpen}
        onClose={() => setIsSellerReviewModalOpen(false)}
        title={`${sellerName}님의 리뷰`}
        review={sellerReview}
        emptyMessage={`${sellerName}님이 아직 리뷰를 보내지 않았습니다.`}
      />

      {/* 리뷰 삭제 확인 모달 */}
      <ConfirmDialog
        open={isDeleteConfirmOpen}
        onCancel={() => {
          if (!isDeleting) setIsDeleteConfirmOpen(false);
        }}
        onConfirm={confirmDeleteReview}
        loading={isDeleting}
        title="리뷰를 삭제할까요?"
        confirmLabel="삭제"
        cancelLabel="취소"
        description="삭제 후에는 되돌릴 수 없습니다."
      />
    </div>
  );
}
