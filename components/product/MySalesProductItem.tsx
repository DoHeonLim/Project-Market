/**
 * File Name : components/product/MySalesProductItem
 * Description : 나의 판매 제품 상세 컴포넌트
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2024.11.30  임도헌   Created
 * 2024.11.30  임도헌   Modified  나의 판매 제품 상세 컴포넌트 추가
 * 2024.12.03  임도헌   Modified  purchase_at을 purchased_at으로 변경
 * 2024.12.05  임도헌   Modified  구매자 리뷰 볼 때 구매자가 누구인지 명시하는 코드 추가
 * 2024.12.12  임도헌   Modified  photo속성에서 images로 변경
 * 2024.12.12  임도헌   Modified  제품 상태 변경 시간 표시 변경
 * 2024.12.22  임도헌   Modified  페이지 디자인 변경, 리뷰 모달 구매자여야되는데 판매자로 되있어서 변경
 * 2024.12.24  임도헌   Modified  다크모드 적용
 * 2025.10.17  임도헌   Modified  lib/* 도메인 분리 + 직렬화 안전 타입 반영
 * 2025.10.17  임도헌   Modified  onMutateTabs 콜백 도입(탭간 동기화)
 * 2025.10.19  임도헌   Modified  낙관적 이동 + 실패 시 롤백/리프레시 연동
 * 2025.10.20  임도헌   Modified  ConfirmDialog로 경고 모달 통일 + 로딩/닫힘 제어 정리
 * 2025.10.20  임도헌   Modified  예약자 선택 onConfirm 위임 + reserved 경로 낙관 이동 추가
 * 2025.10.21  임도헌   Modified  UI 통일(상태Pill/메타칩/타임라인/상대방/지표 뱃지) 추가
 * 2025.11.06  임도헌   Modified  리뷰 삭제 확인을 ConfirmDialog로 일원화 + 삭제 로딩/닫힘 제어
 */

"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useCallback, useMemo } from "react";
import { toast } from "sonner";

import TimeAgo from "../common/TimeAgo";
import UserAvatar from "../common/UserAvatar";
import { SelectUserModal } from "../profile/SelectUserModal";
import CreateReviewModal from "../profile/CreateReviewModal";
import ReviewDetailModal from "../profile/ReviewDetailModal";
import ReservationUserInfo from "../profile/ReservationUserInfo";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import { EyeIcon, HeartIcon } from "@heroicons/react/24/solid";

import { useReview } from "@/hooks/useReview";
import { formatToWon } from "@/lib/utils";
import { getUserInfo } from "@/lib/user/getUserInfo";
import { updateProductStatus } from "@/lib/product/updateProductStatus";
import { deleteReview } from "@/lib/review/deleteReview";
import { deleteAllProductReviews } from "@/lib/review/deleteAllProductReviews";
import { GAME_TYPE_DISPLAY } from "@/lib/constants";
import type { MySalesListItem, ProductReview } from "@/types/product";

type Tab = "selling" | "reserved" | "sold";

interface ProductItemProps {
  product: MySalesListItem;
  type?: Tab;
  userId: number;
  onOptimisticMove?: (p: {
    from: Tab;
    to: Tab;
    product: MySalesListItem;
  }) => () => void;
  onMoveFailed?: (p: { from: Tab; to: Tab }) => Promise<void>;
  onReviewChanged?: (patch: Partial<MySalesListItem>) => void;
}

interface PurchaseUserInfo {
  username: string;
  avatar: string | null;
}

/* ---------- UI 보조 컴포넌트 ---------- */

function StatusPill({ tab }: { tab?: Tab }) {
  if (!tab) return null;
  const map: Record<Tab, string> = {
    selling: "bg-blue-600 dark:bg-blue-500",
    reserved: "bg-amber-500 dark:bg-amber-400",
    sold: "bg-emerald-600 dark:bg-emerald-500",
  };
  const label: Record<Tab, string> = {
    selling: "판매 중",
    reserved: "예약 중",
    sold: "판매 완료",
  };
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-semibold text-white ${map[tab]}`}
    >
      {label[tab]}
    </span>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-700 dark:bg-neutral-700 dark:text-neutral-200">
      {children}
    </span>
  );
}

function Metric({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-1 text-xs text-neutral-600 dark:text-neutral-300">
      {icon}
      {children}
    </span>
  );
}

/* -------------------------------------- */

export default function MySalesProductItem({
  product,
  type,
  userId,
  onOptimisticMove,
  onMoveFailed,
  onReviewChanged,
}: ProductItemProps) {
  // 모달 오픈 상태
  const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isSellerReviewModalOpen, setIsSellerReviewModalOpen] = useState(false);
  const [isBuyerReviewModalOpen, setIsBuyerReviewModalOpen] = useState(false);
  const [isWarningOpen, setIsWarningOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  // 로딩 상태
  const [opLoading, setOpLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // 구매자 정보
  const [purchaseUserInfo, setPurchaseUserInfo] = useState<PurchaseUserInfo>({
    username: product.purchase_user?.username ?? "",
    avatar: product.purchase_user?.avatar ?? null,
  });

  // 리뷰 로컬 상태로 관리(새 작성/삭제 즉시 반영)
  const [reviews, setReviews] = useState<ProductReview[]>(
    product.reviews ?? []
  );
  const sellerReviews = reviews.filter((r) => r.userId === userId);
  const buyerReviews = reviews.filter(
    (r) => r.userId === (product.purchase_userId ?? -1)
  );

  // 리뷰 훅 (판매자)
  const {
    isLoading: reviewLoading,
    error,
    submitReview,
  } = useReview({
    productId: product.id,
    type: "seller",
    onSuccess: (newReview) => {
      // 로컬 최신 상태 기준으로 일관 적용
      setReviews((prev) => {
        const next = [newReview, ...prev.filter((r) => r.userId !== userId)];
        onReviewChanged?.({ reviews: next });
        return next;
      });
    },
  });

  useEffect(() => {
    if (product.reviews && product.reviews !== reviews) {
      setReviews(product.reviews);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.reviews]);

  useEffect(() => {
    if (!product.purchase_user && product.purchase_userId) {
      let mounted = true;
      (async () => {
        const info = await getUserInfo(product.purchase_userId!);
        if (mounted && info) setPurchaseUserInfo(info);
      })();
      return () => {
        mounted = false;
      };
    }
  }, [product.purchase_user, product.purchase_userId]);

  const handleSubmitReview = async (
    text: string,
    rating: number
  ): Promise<boolean> => {
    const res = await submitReview(text, rating);
    if (res.ok) {
      return true;
    }
    return false;
  };

  // 삭제 버튼 클릭 → 확인 모달 오픈
  const handleDeleteReview = () => {
    if (!sellerReviews[0]?.id) return;
    setIsDeleteConfirmOpen(true);
  };

  // 확인 모달에서 실제 삭제 실행
  const confirmDeleteReview = async () => {
    try {
      const reviewId = sellerReviews[0]?.id;
      if (!reviewId) {
        setIsDeleteConfirmOpen(false);
        return;
      }
      setIsDeleting(true);
      await deleteReview(reviewId);
      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
      setIsSellerReviewModalOpen(false);
      onReviewChanged?.({
        reviews: (product.reviews ?? []).filter((r) => r.id !== reviewId),
      });
      toast.success("리뷰를 삭제했어요.");
    } catch (e) {
      console.error("리뷰 삭제 중 오류 발생:", e);
      toast.error("리뷰 삭제 중 오류가 발생했습니다.");
    } finally {
      setIsDeleting(false);
      setIsDeleteConfirmOpen(false);
    }
  };

  // ---------- 상태 변경(낙관적 + 실패 시 롤백/리프레시) ----------
  const runWithOptimistic = useCallback(
    async (to: Tab, action: () => Promise<any>) => {
      if (!type) {
        setOpLoading(true);
        try {
          return await action();
        } finally {
          setOpLoading(false);
        }
      }
      const rollback = onOptimisticMove?.({ from: type, to, product });

      setOpLoading(true);
      try {
        const res = await action();
        if (!res?.success) throw new Error(res?.error || "상태 변경 실패");
        return res;
      } catch (err) {
        rollback?.();
        await onMoveFailed?.({ from: type, to });
        toast.error(
          err instanceof Error
            ? err.message
            : "상태 변경 중 오류가 발생했습니다."
        );
      } finally {
        setOpLoading(false);
      }
    },
    [onOptimisticMove, onMoveFailed, product, type]
  );

  const handleUpdateToSold = async () => {
    await runWithOptimistic("sold", () =>
      updateProductStatus(product.id, "sold")
    );
  };

  const updateProductStatusAndReviews = async () => {
    await runWithOptimistic("selling", async () => {
      const res = await updateProductStatus(product.id, "selling");
      if (res?.success) {
        await deleteAllProductReviews(product.id);
        toast.success(
          "판매중으로 변경했어요. 관련 리뷰는 모두 삭제되었습니다."
        );
        // 즉시 UI 동기화 (리뷰 지표/모달들 반영)
        setReviews([]);
        onReviewChanged?.({ reviews: [] });
      }
      return res;
    });
    setIsWarningOpen(false);
  };

  const handleUpdateToSelling = async () => {
    if (type === "sold") setIsWarningOpen(true);
    else await updateProductStatusAndReviews();
  };

  /** 예약 확정(판매중 → 예약중) */
  const handleReserveConfirm = useCallback(
    async (reservationUserId: number) => {
      const res = await runWithOptimistic("reserved", async () => {
        const r = await updateProductStatus(
          product.id,
          "reserved",
          reservationUserId
        );
        if (r?.success) toast.success("예약 상태로 변경했어요.");
        return r;
      });
      return !!res?.success;
    },
    [product.id, runWithOptimistic]
  );

  // ---------- 파생값(카드 메타, 타임라인, 지표) ----------
  const thumbUrl = product.images?.[0]?.url
    ? `${product.images[0].url}/public`
    : null;

  const createdAt = product.created_at
    ? new Date(product.created_at)
    : undefined;
  const reservationAt = product.reservation_at
    ? new Date(product.reservation_at)
    : undefined;
  const purchasedAt = product.purchased_at
    ? new Date(product.purchased_at)
    : undefined;

  const productHref = `/products/view/${product.id}`;

  const categoryName = product.category?.kor_name ?? null;
  const views = product.views ?? 0;
  const likesCount = product._count.product_likes ?? 0;
  const reviewsCount = reviews.length;

  const myReviewExists = !!sellerReviews.length;
  const otherReviewExists = !!buyerReviews.length;

  const gameChips = useMemo(() => {
    const chips: string[] = [];
    const gt = product.game_type as keyof typeof GAME_TYPE_DISPLAY | undefined;
    if (gt && GAME_TYPE_DISPLAY[gt]) chips.push(GAME_TYPE_DISPLAY[gt]);
    return chips;
  }, [product]);

  const tlMuted = "text-neutral-400 dark:text-neutral-500";
  const tlEmph = "text-neutral-800 dark:text-neutral-200";

  const RESERVATION_STALE_MS = 24 * 60 * 60 * 1000;
  const isReservationStale =
    reservationAt &&
    Date.now() - reservationAt.getTime() > RESERVATION_STALE_MS;

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5 transition-all dark:bg-neutral-800 dark:ring-white/5">
      {/* 상단 행 */}
      <div className="flex gap-5">
        {/* 썸네일 */}
        <Link
          href={productHref}
          className="relative size-28 shrink-0 overflow-hidden rounded-xl ring-1 ring-black/10 dark:ring-white/10"
          aria-label={`${product.title} 상세보기`}
        >
          {thumbUrl ? (
            <Image
              fill
              src={thumbUrl}
              sizes="112px"
              className="object-cover transition-transform duration-200 hover:scale-110"
              alt={product.title}
              priority={type === "selling"}
            />
          ) : (
            <div className="absolute inset-0 bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
          )}
        </Link>

        {/* 본문 */}
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex items-start justify-between gap-3">
            <Link href={productHref} className="min-w-0">
              <h3 className="truncate text-lg font-semibold text-neutral-900 dark:text-white">
                {product.title}
              </h3>
            </Link>

            {/* 상태 + 상대방 */}
            <div className="flex items-center gap-2">
              <StatusPill tab={type} />
              {type === "reserved" && (
                <ReservationUserInfo
                  userId={product.reservation_userId ?? null}
                  fallback={
                    product.reservation_user
                      ? {
                          username: product.reservation_user.username,
                          avatar: product.reservation_user.avatar,
                        }
                      : null
                  }
                />
              )}
              {type === "sold" && purchaseUserInfo?.username && (
                <div className="flex items-center gap-2">
                  <UserAvatar
                    avatar={purchaseUserInfo.avatar}
                    username={purchaseUserInfo.username}
                    size="sm"
                    text="님이 구매"
                  />
                </div>
              )}
            </div>
          </div>

          {/* 가격 */}
          <div className="text-base font-semibold text-primary dark:text-primary-light">
            {formatToWon(product.price)}원
          </div>

          {/* 메타칩 */}
          <div className="flex flex-wrap gap-1.5">
            {gameChips.map((c) => (
              <Chip key={c}>{c}</Chip>
            ))}
            {categoryName && <Chip>{categoryName}</Chip>}
          </div>

          {/* 지표 */}
          <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1">
            <Metric
              icon={<HeartIcon className="size-4 text-rose-600" aria-hidden />}
            >
              {likesCount}
            </Metric>
            <Metric icon={<EyeIcon className="size-4" aria-hidden />}>
              {views}
            </Metric>

            {type === "sold" && (
              <Metric icon={<span aria-hidden>리뷰</span>}>
                {myReviewExists ? 1 : 0}/{otherReviewExists ? 1 : 0} (총{" "}
                {reviewsCount})
              </Metric>
            )}
          </div>

          {/* 타임라인 */}
          <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
            <span className={type === "selling" ? tlEmph : tlMuted}>
              · 등록: {createdAt ? <TimeAgo date={createdAt} /> : "-"}
            </span>
            <span className={type === "reserved" ? tlEmph : tlMuted}>
              · 예약: {reservationAt ? <TimeAgo date={reservationAt} /> : "—"}
            </span>
            <span className={type === "sold" ? tlEmph : tlMuted}>
              · 구매: {purchasedAt ? <TimeAgo date={purchasedAt} /> : "—"}
            </span>
          </div>

          {/* 예약 오래됨 힌트 */}
          {type === "reserved" && isReservationStale && (
            <div className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:bg-amber-900/20 dark:text-amber-300">
              ⏰ 예약 후 시간이 지났어요. 노쇼 위험이 있으면 예약자 변경/확정을
              검토하세요.
            </div>
          )}
        </div>
      </div>

      {/* 액션 영역 */}
      <div className="mt-5 flex gap-3">
        {(type === "sold" || type === "reserved") && (
          <button
            onClick={handleUpdateToSelling}
            className="btn-primary flex-1 py-2.5"
            disabled={opLoading}
            aria-disabled={opLoading}
          >
            판매중으로 변경
          </button>
        )}

        {type === "selling" && (
          <button
            className="btn-primary flex-1 py-2.5"
            onClick={() => setIsReservationModalOpen(true)}
            disabled={opLoading}
            aria-disabled={opLoading}
          >
            예약자 선택
          </button>
        )}

        {type === "reserved" && (
          <button
            onClick={handleUpdateToSold}
            className="btn-primary flex-1 py-2.5"
            disabled={opLoading}
            aria-disabled={opLoading}
          >
            판매완료로 변경
          </button>
        )}

        {type === "sold" && (
          <>
            {sellerReviews.length > 0 ? (
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

      {/* 에러/로딩 */}
      {error && (
        <div className="mt-4 rounded-lg bg-red-100 p-4 text-red-600 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}
      {reviewLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="rounded-lg bg-white p-4 shadow-xl dark:bg-neutral-800">
            <span className="text-neutral-900 dark:text-white">
              리뷰를 등록하는 중...
            </span>
          </div>
        </div>
      )}

      {/* 모달들 */}
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
        review={sellerReviews[0]}
        onDelete={handleDeleteReview}
      />
      <ReviewDetailModal
        isOpen={isBuyerReviewModalOpen}
        onClose={() => setIsBuyerReviewModalOpen(false)}
        title={`${purchaseUserInfo?.username}님의 리뷰`}
        review={buyerReviews[0]}
        emptyMessage={`${purchaseUserInfo?.username}님이 아직 리뷰를 작성하지 않았습니다.`}
      />

      {/* 예약자 선택 모달 */}
      <SelectUserModal
        productId={product.id}
        isOpen={isReservationModalOpen}
        onOpenChange={setIsReservationModalOpen}
        onConfirm={handleReserveConfirm}
      />

      {/* 판매완료 -> 판매중 경고 */}
      <ConfirmDialog
        open={isWarningOpen}
        onCancel={() => {
          if (!opLoading) setIsWarningOpen(false);
        }}
        onConfirm={updateProductStatusAndReviews}
        loading={opLoading}
        title="상태 변경 경고"
        confirmLabel="변경하기"
        cancelLabel="취소"
        description={
          <div className="space-y-3">
            <p className="text-neutral-700 dark:text-neutral-200">
              <strong className="font-medium">{product.title}</strong> 제품을
              <span className="mx-1 font-medium">“판매 중”</span>으로
              변경하시겠습니까?
            </p>
            <div className="rounded-lg bg-red-50 p-3 dark:bg-red-900/20">
              <p className="text-sm text-red-700 dark:text-red-300">
                ⚠️ 주의: 판매 중으로 변경하면 이 제품에 작성된 모든 리뷰가
                삭제됩니다.
              </p>
            </div>
          </div>
        }
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
