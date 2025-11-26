/**
 * File Name : components/stream/StreamTopbar
 * Description : 스트리밍 상세 상단바(뒤로가기 + 가시성 칩 + 공유 + 채팅 토글 버튼)
 * Author : 임도헌
 *
 * History
 * 2025.11.15  임도헌   Created   최소 props 구성으로 재작성(BackButton/Visibility/Share)
 * 2025.11.15  임도헌   Modified  채팅 열기 버튼(닫힘 상태에서만 노출) - 이벤트 버스 연동
 */

"use client";

import { useEffect, useState } from "react";
import BackButton from "@/components/common/BackButton";
import {
  ShareIcon,
  LockClosedIcon,
  UserGroupIcon,
  GlobeAltIcon,
  ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/outline";
import { toast } from "sonner";
import {
  STREAM_VISIBILITY,
  STREAM_VISIBILITY_DISPLAY,
  type StreamVisibility,
} from "@/lib/constants";

type Props = {
  /** 접근 정책 (PUBLIC | PRIVATE | FOLLOWERS) */
  visibility: string;
  /** 뒤로가기 폴백 경로 (기본 /streams) */
  backFallbackHref?: string;
  /** sticky 해제 옵션 */
  sticky?: boolean;
  /** 상단/좌우 패딩 커스터마이즈 */
  className?: string;
};

export default function StreamTopbar({
  visibility,
  backFallbackHref = "/streams",
  sticky = true,
  className = "",
}: Props) {
  // ---- 채팅 열림 상태: 채팅 컴포넌트가 브로드캐스트하는 이벤트를 수신해서 반영 ----
  const [chatOpen, setChatOpen] = useState(true);

  useEffect(() => {
    const onState = (e: Event) => {
      const detail = (e as CustomEvent<{ open: boolean }>).detail;
      if (typeof detail?.open === "boolean") setChatOpen(detail.open);
    };
    window.addEventListener("stream:chat:state", onState as EventListener);
    return () =>
      window.removeEventListener("stream:chat:state", onState as EventListener);
  }, []);

  const openChatFromTopbar = () => {
    // 채팅에게 열라고 브로드캐스트
    const evt = new CustomEvent("stream:chat:open");
    window.dispatchEvent(evt);
    setChatOpen(true);
  };

  // --- 가시성 라벨(타입 안전) ---
  const visLabel =
    STREAM_VISIBILITY_DISPLAY[visibility as StreamVisibility] ?? "공개";

  // --- 가시성 칩 아이콘/색상 ---
  const visChip = (() => {
    if (visibility === STREAM_VISIBILITY.PRIVATE) {
      return {
        icon: <LockClosedIcon className="h-3.5 w-3.5" aria-hidden="true" />,
        className: "bg-amber-700 text-white/95",
      };
    }
    if (visibility === STREAM_VISIBILITY.FOLLOWERS) {
      return {
        icon: <UserGroupIcon className="h-3.5 w-3.5" aria-hidden="true" />,
        className: "bg-indigo-700 text-white",
      };
    }
    // PUBLIC
    return {
      icon: <GlobeAltIcon className="h-3.5 w-3.5" aria-hidden="true" />,
      className: "bg-neutral-900/80 text-white",
    };
  })();

  const handleShare = async () => {
    const shareUrl = typeof window !== "undefined" ? window.location.href : "";
    try {
      if (navigator.share) {
        await navigator.share({ url: shareUrl });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast.success("링크를 클립보드에 복사했어요.");
      }
    } catch {
      // 취소 등은 무시
    }
  };

  return (
    <header
      className={[
        sticky ? "sticky top-0 z-40" : "",
        "backdrop-blur-md bg-white/70 dark:bg-neutral-900/70",
        "border-b border-neutral-200/70 dark:border-neutral-800",
        className,
      ].join(" ")}
      role="banner"
    >
      <div className="mx-auto max-w-[100rem] h-12 sm:h-14 grid grid-cols-[auto,1fr,auto] items-center gap-2 px-2 sm:px-4">
        {/* Left: Back + (닫힘 시) 채팅 열기 */}
        <div className="flex items-center gap-2">
          <BackButton fallbackHref={backFallbackHref} />
          {!chatOpen && (
            <button
              type="button"
              onClick={openChatFromTopbar}
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold
                         bg-neutral-200 hover:bg-neutral-300
                         dark:bg-neutral-800 dark:hover:bg-neutral-700"
              aria-label="채팅 열기"
              title="채팅 열기"
            >
              <ChatBubbleLeftRightIcon className="h-4 w-4" />
              채팅 열기
            </button>
          )}
        </div>

        {/* Right: Visibility chip + Share */}
        <div className="flex items-center justify-end gap-2">
          <span
            className={`inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-semibold ${visChip.className}`}
            aria-label={`접근 정책: ${visLabel}`}
            title={`접근: ${visLabel}`}
          >
            {visChip.icon}
            {visLabel}
          </span>

          <button
            type="button"
            onClick={handleShare}
            aria-label="스트림 공유"
            title="공유"
            className="rounded-md p-2 hover:bg-black/5 dark:hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-primary/60"
          >
            <ShareIcon className="h-5 w-5 text-neutral-700 dark:text-neutral-200" />
          </button>
        </div>
      </div>
    </header>
  );
}
