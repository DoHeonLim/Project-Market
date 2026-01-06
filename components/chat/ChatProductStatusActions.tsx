/**
 * File Name : components/chat/ChatProductStatusActions
 * Description : 채팅 헤더용 상품 상태 액션 바 (예약/판매완료)
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2025.12.02  임도헌   Created   채팅방에서 예약/판매완료 상태 변경 버튼 추가
 */

"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { updateProductStatus } from "@/lib/product/updateProductStatus";
import type { ChatUser } from "@/types/chat";

type ProductStatus = "selling" | "reserved" | "sold";

interface ChatProductStatusActionsProps {
  /** 현재 로그인한 유저 id (viewer) */
  viewerId: number;
  /** 채팅 상대 유저 (이 유저를 예약자/구매자로 보는 관점) */
  otherUser: ChatUser;
  /** 채팅 대상 상품 */
  product: {
    id: number;
    title: string;
    userId: number; // 판매자 id
    reservation_userId: number | null;
    purchase_userId: number | null;
  };
}

function deriveStatus(p: {
  reservation_userId: number | null;
  purchase_userId: number | null;
}): ProductStatus {
  if (p.purchase_userId) return "sold";
  if (p.reservation_userId) return "reserved";
  return "selling";
}

export default function ChatProductStatusActions({
  viewerId,
  otherUser,
  product,
}: ChatProductStatusActionsProps) {
  const [pending, startTransition] = useTransition();

  // 헤더 안에서만 쓸 가벼운 로컬 상태 (예약/판매 여부만)
  const [localReservationUserId, setLocalReservationUserId] = useState<
    number | null
  >(product.reservation_userId);
  const [localPurchaseUserId, setLocalPurchaseUserId] = useState<number | null>(
    product.purchase_userId
  );

  const status: ProductStatus = useMemo(
    () =>
      deriveStatus({
        reservation_userId: localReservationUserId,
        purchase_userId: localPurchaseUserId,
      }),
    [localReservationUserId, localPurchaseUserId]
  );

  const isSeller = viewerId === product.userId;
  const isReservedToThisUser =
    status === "reserved" && localReservationUserId === otherUser.id;
  const isSoldToThisUser =
    status === "sold" && localPurchaseUserId === otherUser.id;

  // 판매자가 아닐 때 → 상태 설명만
  if (!isSeller) {
    return (
      <div className="mt-1 text-[11px] text-neutral-500 dark:text-neutral-400">
        {status === "sold" ? (
          isSoldToThisUser ? (
            <>
              이 상품은 이미 <strong>{otherUser.username}</strong>님과 거래가
              완료되었어요.
            </>
          ) : (
            <>이 상품은 이미 다른 크루에게 판매 완료된 상태예요.</>
          )
        ) : status === "reserved" ? (
          localReservationUserId === viewerId ? (
            <>
              이 상품은 지금 <strong>내가</strong> 예약 중인 상태예요.
            </>
          ) : (
            <>이 상품은 이미 다른 크루에게 예약된 상태예요.</>
          )
        ) : (
          <>
            판매자가 이 채팅에서 예약 또는 거래 완료로 상태를 변경할 수 있어요.
          </>
        )}
      </div>
    );
  }

  // ------------------ 판매자 액션 ------------------

  const handleReserveToThisUser = () => {
    if (pending) return;

    startTransition(async () => {
      const res = await updateProductStatus(
        product.id,
        "reserved",
        otherUser.id
      );
      if (!res?.success) {
        toast.error(res?.error ?? "예약 상태 변경에 실패했습니다.");
        return;
      }
      setLocalReservationUserId(otherUser.id);
      setLocalPurchaseUserId(null);
      toast.success(`${otherUser.username}님을 예약자로 지정했어요.`);
    });
  };

  const handleMarkSoldToThisUser = () => {
    if (pending) return;

    startTransition(async () => {
      const res = await updateProductStatus(product.id, "sold");
      if (!res?.success) {
        toast.error(res?.error ?? "판매 완료 상태 변경에 실패했습니다.");
        return;
      }
      // 서버 로직상 예약자를 구매자로 승격시킨다고 가정
      setLocalPurchaseUserId(otherUser.id);
      setLocalReservationUserId(null);
      toast.success(
        `${otherUser.username}님과의 거래를 판매 완료로 변경했어요.`
      );
    });
  };

  return (
    <div className="mt-1 flex flex-wrap gap-2 text-[11px]">
      {status === "selling" && (
        <button
          type="button"
          onClick={handleReserveToThisUser}
          disabled={pending}
          className="px-2.5 py-1 rounded-full text-xs font-medium
                     bg-primary/10 text-primary dark:bg-primary-light/10 dark:text-primary-light
                     disabled:opacity-60"
        >
          {otherUser.username}님을 예약자로 지정
        </button>
      )}

      {status === "reserved" && (
        <>
          {isReservedToThisUser ? (
            <button
              type="button"
              onClick={handleMarkSoldToThisUser}
              disabled={pending}
              className="px-2.5 py-1 rounded-full text-xs font-medium
                         bg-emerald-500 text-white disabled:opacity-60"
            >
              {otherUser.username}님과 거래 완료로 변경
            </button>
          ) : (
            <span className="text-neutral-500 dark:text-neutral-400">
              이미 다른 크루에게 예약된 상품이에요.
            </span>
          )}
        </>
      )}

      {status === "sold" && (
        <span className="text-emerald-600 dark:text-emerald-400 font-medium">
          판매 완료된 상품입니다.
        </span>
      )}
    </div>
  );
}
