/**
 * File Name : components/chat/ChatHeader
 * Description : 채팅 상단 헤더 (상대 유저 + 제품 정보 + 앱바 액션)
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2025.07.14  임도헌   Created   ChatMessagesList에서 분리
 * 2025.07.15  임도헌   Modified  UI 변경
 * 2025.11.13  임도헌   Modified  BackButton 도입, 앱바/접근성/다크모드 정합
 * 2025.12.02  임도헌   Modified  counterparty/미트볼 메뉴/채팅방 나가기/상품 상태 변경 기능 추가
 */

"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { EllipsisHorizontalIcon } from "@heroicons/react/24/outline";
import { toast } from "sonner";

import UserAvatar from "../common/UserAvatar";
import BackButton from "@/components/common/BackButton";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import { formatToWon } from "@/lib/utils";
import type { ChatUser } from "@/types/chat";
import { leaveChatRoomAction } from "@/app/chats/[id]/actions/room";
import { updateProductStatus } from "@/lib/product/updateProductStatus";
import { deleteAllProductReviews } from "@/lib/review/deleteAllProductReviews";

interface ChatHeaderProduct {
  id: number;
  title: string;
  images: { url: string }[];
  price: number;
  userId: number; // 판매자 ID
  reservation_userId: number | null;
  purchase_userId: number | null;
}

interface ChatHeaderProps {
  chatRoomId: string;
  viewerId: number;
  counterparty: ChatUser;
  product: ChatHeaderProduct;
}

export default function ChatHeader({
  chatRoomId,
  viewerId,
  counterparty,
  product,
}: ChatHeaderProps) {
  const router = useRouter();

  const [menuOpen, setMenuOpen] = useState(false);
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
  const [revertDialogOpen, setRevertDialogOpen] = useState(false);

  const [isLeaving, startLeaveTransition] = useTransition();
  const [isUpdatingStatus, startStatusTransition] = useTransition();

  // 로컬에서 상품 상태 추적 (예약/판매완료 뱃지 업데이트용)
  const [productState, setProductState] = useState<ChatHeaderProduct>(product);

  const img = productState.images?.[0]?.url ?? "";

  const isSeller = viewerId === productState.userId;
  const isReserved =
    !!productState.reservation_userId && !productState.purchase_userId;
  const isSold = !!productState.purchase_userId;
  const isSelling = !isReserved && !isSold;
  const isCurrentReservationHolder =
    isReserved && productState.reservation_userId === counterparty.id;

  const productHref = `/products/view/${productState.id}`;
  const profileHref = `/profile/${counterparty.username}`;

  //채팅방 나가기
  const handleLeaveRoom = () => {
    startLeaveTransition(async () => {
      const res = await leaveChatRoomAction(chatRoomId);
      if (!res?.success) {
        toast.error(res?.error ?? "채팅방 나가기 중 오류가 발생했습니다.");
        return;
      }
      toast.success("대화방을 나갔어요.");
      router.replace("/chat");
    });
  };

  //상품 상태 변경 핸들러들 (판매자만 사용)

  // 판매중 → (이 유저를) 예약중
  const handleReserveCounterparty = () => {
    setMenuOpen(false);
    startStatusTransition(async () => {
      const res = await updateProductStatus(
        productState.id,
        "reserved",
        counterparty.id
      );
      if (!res?.success) {
        toast.error(res?.error ?? "예약자로 지정하는 데 실패했습니다.");
        return;
      }
      toast.success(`${counterparty.username}님을 예약자로 지정했어요.`);
      setProductState((prev) => ({
        ...prev,
        reservation_userId: counterparty.id,
        purchase_userId: null,
      }));
    });
  };

  // 예약중 → 판매중 (예약 해제 + 리뷰 초기화)
  const handleReservedToSelling = () => {
    setMenuOpen(false);
    startStatusTransition(async () => {
      const res = await updateProductStatus(productState.id, "selling");
      if (!res?.success) {
        toast.error(res?.error ?? "판매중으로 변경하지 못했어요.");
        return;
      }

      // MySalesProductItem과 동일하게 리뷰도 정리
      await deleteAllProductReviews(productState.id).catch((err) =>
        console.error("deleteAllProductReviews error:", err)
      );

      toast.success("판매 중으로 변경했어요. 관련 리뷰가 초기화되었습니다.");
      setProductState((prev) => ({
        ...prev,
        reservation_userId: null,
        purchase_userId: null,
      }));
    });
  };

  // 예약중(현재 예약자 = 이 유저) → 판매완료
  const handleReservedToSold = () => {
    setMenuOpen(false);
    startStatusTransition(async () => {
      const res = await updateProductStatus(productState.id, "sold");
      if (!res?.success) {
        toast.error(res?.error ?? "판매완료로 변경하지 못했어요.");
        return;
      }
      toast.success("판매 완료로 변경했어요.");
      setProductState((prev) => ({
        ...prev,
        purchase_userId: prev.reservation_userId ?? counterparty.id,
        reservation_userId: null,
      }));
    });
  };

  // 판매완료 → 판매중 (리뷰 삭제 + ConfirmDialog에서 호출)
  const handleSoldToSelling = () => {
    startStatusTransition(async () => {
      const res = await updateProductStatus(productState.id, "selling");
      if (!res?.success) {
        toast.error(res?.error ?? "판매중으로 되돌리지 못했어요.");
        return;
      }

      await deleteAllProductReviews(productState.id).catch((err) =>
        console.error("deleteAllProductReviews error:", err)
      );

      toast.success(
        "판매 중으로 되돌렸어요. 이 제품에 작성된 리뷰도 모두 삭제되었습니다."
      );
      setProductState((prev) => ({
        ...prev,
        reservation_userId: null,
        purchase_userId: null,
      }));
      setRevertDialogOpen(false);
    });
  };

  return (
    <header
      className="
        sticky top-0 z-40
        bg-white/80 dark:bg-neutral-900/80
        backdrop-blur supports-[backdrop-filter]:bg-white/60
        border-b border-neutral-200/70 dark:border-neutral-800
      "
    >
      <div className="mx-auto w-full max-w-screen-sm px-2.5 sm:px-3">
        <div className="h-11 sm:h-[52px] flex items-center gap-2 sm:gap-3">
          {/* 1) 뒤로가기 */}
          <BackButton fallbackHref="/chat" variant="appbar" />

          {/* 2) 상대 유저 (counterparty) */}
          <button
            type="button"
            onClick={() => router.push(profileHref)}
            className="flex items-center min-w-0 gap-1.5 sm:gap-2"
            aria-label={`${counterparty.username} 프로필 보기`}
          >
            <UserAvatar
              avatar={counterparty.avatar}
              username={counterparty.username}
              showUsername
            />
          </button>

          {/* 3) 우측: 상품 미니 카드 */}
          <Link
            href={productHref}
            className="ml-auto mr-1 flex items-center gap-2 min-w-0 group"
            prefetch={false}
            aria-label={`${productState.title} 상세로 이동`}
          >
            <div className="relative size-9 sm:size-11 rounded-lg overflow-hidden border border-neutral-200/60 dark:border-neutral-700 flex-shrink-0">
              {img ? (
                <Image
                  src={`${img}/avatar`}
                  alt={productState.title}
                  sizes="48px"
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-neutral-200 dark:bg-neutral-800" />
              )}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="truncate text-[12px] sm:text-[14px] font-medium text-neutral-900 dark:text-neutral-100">
                {productState.title}
              </span>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-[11px] sm:text-xs font-semibold text-primary dark:text-primary-light">
                  💰 {formatToWon(productState.price)}원
                </span>
                {isReserved && (
                  <span className="text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                    예약중
                  </span>
                )}
                {isSold && (
                  <span className="text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded bg-neutral-200 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-200">
                    판매완료
                  </span>
                )}
              </div>
            </div>
          </Link>

          {/* 4) 우측: 미트볼 메뉴 */}
          <div className="relative flex-shrink-0">
            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800"
              aria-label="채팅 옵션 열기"
              onClick={() => setMenuOpen((prev) => !prev)}
            >
              <EllipsisHorizontalIcon className="h-5 w-5 text-neutral-600 dark:text-neutral-200" />
            </button>

            {menuOpen && (
              <div
                className="
                  absolute right-0 mt-1 w-48 sm:w-52 origin-top-right rounded-lg
                  bg-white shadow-lg ring-1 ring-black/5
                  dark:bg-neutral-800 dark:ring-white/10
                  text-[13px] sm:text-sm py-1 z-50
                "
              >
                {/* 상대 프로필 보기 */}
                <button
                  type="button"
                  className="block w-full px-3 py-1.5 text-left hover:bg-neutral-100 dark:hover:bg-neutral-700"
                  onClick={() => {
                    setMenuOpen(false);
                    router.push(profileHref);
                  }}
                >
                  상대 프로필 보기
                </button>

                {/* 상품 상세 보기 */}
                <button
                  type="button"
                  className="block w-full px-3 py-1.5 text-left hover:bg-neutral-100 dark:hover:bg-neutral-700"
                  onClick={() => {
                    setMenuOpen(false);
                    router.push(productHref);
                  }}
                >
                  상품 상세 보기
                </button>

                {/* 판매자용 상태 변경 메뉴 */}
                {isSeller && (
                  <>
                    <div className="my-1 border-t border-neutral-200 dark:border-neutral-700" />

                    {isSelling && (
                      <button
                        type="button"
                        className="block w-full px-3 py-1.5 text-left hover:bg-neutral-100 dark:hover:bg-neutral-700 disabled:opacity-60"
                        onClick={handleReserveCounterparty}
                        disabled={isUpdatingStatus}
                      >
                        {counterparty.username}님을 예약자로 지정
                      </button>
                    )}

                    {isReserved && (
                      <>
                        {isCurrentReservationHolder ? (
                          <>
                            <button
                              type="button"
                              className="block w-full px-3 py-1.5 text-left hover:bg-neutral-100 dark:hover:bg-neutral-700 disabled:opacity-60"
                              onClick={handleReservedToSelling}
                              disabled={isUpdatingStatus}
                            >
                              예약 취소 후 판매중으로 변경
                            </button>
                            <button
                              type="button"
                              className="block w-full px-3 py-1.5 text-left hover:bg-neutral-100 dark:hover:bg-neutral-700 disabled:opacity-60"
                              onClick={handleReservedToSold}
                              disabled={isUpdatingStatus}
                            >
                              이 유저에게 판매완료 처리
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            className="block w-full px-3 py-1.5 text-left text-neutral-400 cursor-not-allowed"
                            disabled
                          >
                            다른 유저가 예약 중입니다
                          </button>
                        )}
                      </>
                    )}

                    {isSold && (
                      <button
                        type="button"
                        className="block w-full px-3 py-1.5 text-left hover:bg-neutral-100 dark:hover:bg-neutral-700 text-amber-600 dark:text-amber-300 disabled:opacity-60"
                        onClick={() => {
                          setMenuOpen(false);
                          setRevertDialogOpen(true);
                        }}
                        disabled={isUpdatingStatus}
                      >
                        판매중으로 되돌리기
                      </button>
                    )}

                    <div className="my-1 border-t border-neutral-200 dark:border-neutral-700" />
                  </>
                )}

                {/* 대화방 나가기 */}
                <button
                  type="button"
                  className="block w-full px-3 py-1.5 text-left text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                  onClick={() => {
                    setMenuOpen(false);
                    setLeaveDialogOpen(true);
                  }}
                >
                  대화방 나가기
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 채팅방 나가기 확인 모달 */}
      <ConfirmDialog
        open={leaveDialogOpen}
        onCancel={() => {
          if (!isLeaving) setLeaveDialogOpen(false);
        }}
        onConfirm={handleLeaveRoom}
        loading={isLeaving}
        title="대화방을 나갈까요?"
        confirmLabel="나가기"
        cancelLabel="취소"
        description="대화방을 나가면 내 목록에서 사라집니다. 상대방에게는 기존 대화 내용이 남아 있을 수 있어요."
      />

      {/* 판매완료 → 판매중 되돌리기 확인 모달 */}
      <ConfirmDialog
        open={revertDialogOpen}
        onCancel={() => {
          if (!isUpdatingStatus) setRevertDialogOpen(false);
        }}
        onConfirm={handleSoldToSelling}
        loading={isUpdatingStatus}
        title="판매 상태를 되돌릴까요?"
        confirmLabel="판매중으로 변경"
        cancelLabel="취소"
        description="판매 완료를 취소하고 다시 '판매 중' 상태로 돌립니다. 이 제품에 작성된 모든 리뷰가 삭제됩니다."
      />
    </header>
  );
}
