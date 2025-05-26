/**
File Name : components/product/MySalseProductItem
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
2024.12.22  임도헌   Modified  페이지 디자인 변경, 리뷰 모달 구매자여야되는데 판매자로 되있어서 변경
2024.12.24  임도헌   Modified  다크모드 적용
*/
import Image from "next/image";
import Link from "next/link";
import { formatToWon } from "@/lib/utils";
import { useEffect, useState } from "react";
import { SelectUserModal } from "../profile/SelectUserModal";
import {
  getUserInfo,
  updateProductStatus,
} from "@/app/(tabs)/profile/(product)/my-sales/actions";
import CreateReviewModal from "../profile/CreateReviewModal";
import { useReview } from "@/hooks/useReview";
import StatusChangeWarningModal from "./StatusChangeWarningModal";
import { deleteAllProductReviews } from "@/app/(tabs)/profile/(product)/my-sales/actions";
import ReviewDetailModal from "../profile/ReviewDetailModal";
import { deleteReview } from "@/app/(tabs)/profile/(product)/my-purchases/actions";
import ReservationUserInfo from "../profile/ReservationUserInfo";
import TimeAgo from "../common/TimeAgo";
import UserAvatar from "../common/UserAvatar";

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

interface PurchaseUserInfo {
  username: string;
  avatar: string | null;
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
  const [purchaseUserInfo, setPurchaseUserInfo] = useState<PurchaseUserInfo>({
    username: "",
    avatar: null,
  });

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
    const fetchPurchaseUserInfo = async () => {
      const purchaseUserInfo = await getUserInfo(product.purchase_userId!);
      if (purchaseUserInfo) {
        setPurchaseUserInfo(purchaseUserInfo);
      }
    };
    fetchPurchaseUserInfo();
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
      setIsWarningModalOpen(false);
    } catch (error) {
      console.error("상태 변경 중 오류:", error);
      alert("상태 변경 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 transition-all">
      <div className="flex gap-5">
        <Link href={`/products/${product.id}`} className="flex gap-5 flex-1">
          <div className="relative overflow-hidden rounded-lg size-28 border border-neutral-200 dark:border-neutral-700">
            <Image
              fill
              src={`${product.images[0]?.url}/public`}
              sizes="(max-width: 768px) 112px, 112px"
              className="object-cover hover:scale-110 transition-transform duration-200"
              alt={product.title}
            />
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-lg font-medium text-neutral-900 dark:text-white">
              {product.title}
            </span>
            <TimeAgo date={product.created_at.toString()} />
            <span className="text-lg font-semibold text-primary dark:text-primary-light">
              {formatToWon(product.price)}원
            </span>

            {type === "reserved" &&
              product.reservation_at &&
              !product.purchased_at && (
                <span className="text-sm text-accent dark:text-accent-light flex items-center gap-1">
                  <span className="size-2 bg-accent dark:bg-accent-light rounded-full" />
                  예약일: <TimeAgo date={product.reservation_at.toString()} />
                </span>
              )}

            {type === "sold" && product.purchased_at && (
              <span className="text-sm text-secondary dark:text-secondary-light flex items-center gap-1">
                <span className="size-2 bg-secondary dark:bg-secondary-light rounded-full" />
                등록일: <TimeAgo date={product.created_at.toString()} />
              </span>
            )}
          </div>
        </Link>
        {type === "reserved" && (
          <ReservationUserInfo userId={product.reservation_userId} />
        )}
        {type === "sold" && purchaseUserInfo && (
          <div className="flex flex-col items-end gap-2">
            <UserAvatar
              avatar={purchaseUserInfo.avatar}
              username={purchaseUserInfo.username}
              text="님이 구매"
              size="md"
            />
            {product.purchased_at && (
              <span className="text-sm text-green-500 dark:text-green-400 flex items-center gap-1">
                <span className="size-2 bg-green-500 dark:bg-green-400 rounded-full" />
                구매일: <TimeAgo date={product.purchased_at.toString()} />
              </span>
            )}
          </div>
        )}
      </div>
      <div className="flex gap-3 mt-6">
        {(type === "sold" || type === "reserved") && (
          <button
            onClick={handleUpdateToSelling}
            className="btn-primary flex-1 py-2.5"
          >
            판매중으로 변경
          </button>
        )}
        {type === "selling" && (
          <button
            className="btn-primary flex-1 py-2.5"
            onClick={() => setIsReservationModalOpen(true)}
          >
            예약자 선택
          </button>
        )}
        {type === "reserved" && (
          <button
            onClick={handleUpdateToSold}
            className="btn-primary flex-1 py-2.5"
          >
            판매완료로 변경
          </button>
        )}
        {type === "sold" && (
          <>
            {sellerReviews?.length > 0 ? (
              <button
                onClick={() => setIsSellerReviewModalOpen(true)}
                className="btn-secondary flex-1 py-2.5"
              >
                내가 쓴 리뷰 보기
              </button>
            ) : (
              <button
                onClick={() => setIsReviewModalOpen(true)}
                className="btn-primary flex-1 py-2.5"
              >
                리뷰 작성
              </button>
            )}
            <button
              onClick={() => setIsBuyerReviewModalOpen(true)}
              className="btn-secondary flex-1 py-2.5"
            >
              리뷰 보기
            </button>
          </>
        )}
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
        username={purchaseUserInfo.username}
        userAvatar={purchaseUserInfo.avatar}
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
        title={`${purchaseUserInfo?.username}님의 리뷰`}
        review={buyerReviews?.[0]}
        emptyMessage={`${purchaseUserInfo?.username}님이 아직 리뷰를 작성하지 않았습니다.`}
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
