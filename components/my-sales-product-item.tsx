/**
File Name : components/my-salse-product-item
Description : 나의 판매 제품 상세 컴포넌트
Author : 임도헌

History
Date        Author   Status    Description
2024.11.30  임도헌   Created
2024.11.30  임도헌   Modified  나의 판매 제품 상세 컴포넌트 추가
2024.12.03  임도헌   Modified  purchase_at을 purchased_at으로 변경
2024.12.05  임도헌   Modified  구매자 리뷰 볼 때 구매자가 누구인지 명시하는 코드 추가
2024.12.12  임도헌   Modified  photo속성에서 images로 변경
2024.12.12  임도헌   Modified  제품 상태 변경 시간 표시 변경
*/
import Image from "next/image";
import Link from "next/link";
import { formatToWon } from "@/lib/utils";
import { useEffect, useState } from "react";
import { SelectUserModal } from "./modals/select-user-modal";
import {
  getPurchaseUsername,
  updateProductStatus,
} from "@/app/(tabs)/profile/(product)/my-sales/actions";
import CreateReviewModal from "./modals/create-review-modal";
import { useReview } from "@/hooks/useReview";
import StatusChangeWarningModal from "./modals/status-change-warning-modal";
import { deleteAllProductReviews } from "@/app/(tabs)/profile/(product)/my-sales/actions";
import ReviewDetailModal from "./modals/review-detail-modal";
import { deleteReview } from "@/app/(tabs)/profile/(product)/my-purchases/actions";
import ReservationUserInfo from "./reservation-user-info";
import TimeAgo from "./time-ago";

interface ProductItemProps {
  product: {
    id: number;
    title: string;
    price: number;
    images: {
      url: string;
    }[];
    created_at: Date;
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
  type?: "selling" | "reserved" | "sold";
  userId: number;
}

export default function MySalesProductItem({
  product,
  type,
  userId,
}: ProductItemProps) {
  const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isSellerReviewModalOpen, setIsSellerReviewModalOpen] = useState(false);
  const [isBuyerReviewModalOpen, setIsBuyerReviewModalOpen] = useState(false);
  const [isWarningModalOpen, setIsWarningModalOpen] = useState(false);
  const [purchaseUsername, setPurchaseUsername] = useState<string | null>("");

  const sellerReviews = product.reviews?.filter(
    (review) => review.userId === userId
  );

  const buyerReviews = product.reviews?.filter(
    (review) => review.userId === product.purchase_userId
  );

  const { isLoading, error, submitReview } = useReview({
    productId: product.id,
    userId: userId,
    type: "seller",
  });

  useEffect(() => {
    if (!product.purchase_userId) return;
    const fetchPurchaseUsername = async () => {
      const username = await getPurchaseUsername(product.purchase_userId);
      if (username) {
        setPurchaseUsername(username);
      }
    };
    fetchPurchaseUsername();
  }, [product.purchase_userId]);

  const handleSubmitReview = async (text: string, rating: number) => {
    await submitReview(text, rating);
    if (!error) {
      setIsReviewModalOpen(false);
    }
  };

  const handleDeleteReview = async () => {
    try {
      if (!sellerReviews[0]?.id) return;

      const confirmed = confirm("리뷰를 삭제하시겠습니까?");
      if (!confirmed) return;

      await deleteReview(sellerReviews[0].id, "seller");
      setIsSellerReviewModalOpen(false);
    } catch (error) {
      console.error("리뷰 삭제 중 오류 발생:", error);
      alert("리뷰 삭제 중 오류가 발생했습니다.");
    }
  };

  const handleUpdateToSold = async () => {
    await updateProductStatus(product.id, "sold");
    alert("판매 완료로 변경되었습니다.");
  };

  const handleUpdateToSelling = async () => {
    if (type === "sold") {
      setIsWarningModalOpen(true);
    } else {
      await updateProductStatusAndReviews();
    }
  };

  const updateProductStatusAndReviews = async () => {
    try {
      await updateProductStatus(product.id, "selling");
      await deleteAllProductReviews(product.id);
      alert("판매 중으로 변경되었습니다.");
      setIsWarningModalOpen(false);
    } catch (error) {
      console.error("상태 변경 중 오류:", error);
      alert("상태 변경 중 오류가 발생했습니다.");
    }
  };

  return (
    <div>
      <div className="flex gap-5">
        <Link href={`/products/${product.id}`} className="flex gap-5 flex-1">
          <div className="relative overflow-hidden rounded-md size-28">
            <Image
              fill
              src={product.images[0]?.url}
              sizes="(max-width: 768px) 112px, 112px"
              className="object-cover"
              alt={product.title}
            />
          </div>
          <div className="flex flex-col gap-1 *:text-white">
            <span className="text-lg">{product.title}</span>
            <TimeAgo date={product.created_at.toString()} />
            <span className="text-lg font-semibold">
              {formatToWon(product.price)}원
            </span>

            {type === "reserved" &&
              product.reservation_at &&
              !product.purchased_at && (
                <>
                  <span className="text-sm text-yellow-500">
                    예약일: <TimeAgo date={product.reservation_at.toString()} />
                  </span>
                </>
              )}

            {type === "sold" && product.purchased_at && (
              <span className="text-sm text-green-500">
                판매일: <TimeAgo date={product.purchased_at.toString()} />
              </span>
            )}
          </div>
        </Link>
        {type === "reserved" && (
          <ReservationUserInfo userId={product.reservation_userId} />
        )}
      </div>
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
        {type === "sold" && sellerReviews?.length > 0 ? (
          <button
            onClick={() => setIsSellerReviewModalOpen(true)}
            className="px-4 py-2 font-semibold transition-colors bg-blue-600 rounded-md hover:bg-blue-400"
          >
            내가 쓴 리뷰 보기
          </button>
        ) : (
          type === "sold" && (
            <button
              onClick={() => setIsReviewModalOpen(true)}
              className="px-5 py-2.5 font-semibold bg-indigo-600 rounded-md hover:bg-indigo-400 transition-colors"
            >
              {purchaseUsername}님의 리뷰 작성
            </button>
          )
        )}
        {type === "sold" && (
          <button
            onClick={() => setIsBuyerReviewModalOpen(true)}
            className="px-4 py-2 font-semibold transition-colors bg-green-600 rounded-md hover:bg-green-400"
          >
            {purchaseUsername}님의 리뷰 보기
          </button>
        )}
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

      <ReviewDetailModal
        isOpen={isSellerReviewModalOpen}
        onClose={() => setIsSellerReviewModalOpen(false)}
        title="내가 쓴 리뷰"
        review={sellerReviews?.[0]}
        onDelete={handleDeleteReview}
      />

      <ReviewDetailModal
        isOpen={isBuyerReviewModalOpen}
        onClose={() => setIsBuyerReviewModalOpen(false)}
        title={`${purchaseUsername}님의 리뷰`}
        review={buyerReviews?.[0]}
        emptyMessage={`${purchaseUsername}님이 아직 리뷰를 작성하지 않았습니다.`}
      />

      <SelectUserModal
        productId={product.id}
        isOpen={isReservationModalOpen}
        onOpenChange={setIsReservationModalOpen}
      />

      <StatusChangeWarningModal
        isOpen={isWarningModalOpen}
        onClose={() => setIsWarningModalOpen(false)}
        onConfirm={updateProductStatusAndReviews}
        productTitle={product.title}
      />
    </div>
  );
}
