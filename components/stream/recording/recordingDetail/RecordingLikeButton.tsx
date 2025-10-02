/**
 * File Name : components/stream/recording/recordingDetail/RecordingLikeButton
 * Description : 스트리밍 녹화본(VodAsset) 좋아요 버튼 컴포넌트
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2025.08.07  임도헌   Created   post 방식 기반 녹화본 좋아요 버튼 컴포넌트 구현
 * 2025.09.10  임도헌   Modified  useOptimistic 제거 → 로컬 상태 + 낙관 업데이트
 * 2025.09.20  임도헌   Modified  VodAsset 단위로 전환(streamId → vodId)
 */

"use client";

import { useEffect, useState, useTransition } from "react";
import { HeartIcon } from "@heroicons/react/24/solid";
import { HeartIcon as OutlineHeartIcon } from "@heroicons/react/24/outline";
import { toast } from "sonner";
import {
  likeRecording,
  dislikeRecording,
} from "@/app/streams/[id]/recording/actions/likes";

type LikeResult =
  | { success: true; isLiked: boolean; likeCount: number }
  | { success: false; error: string }
  | void; // 서버가 값을 안 돌려주는 기존 버전도 허용

interface RecordingLikeButtonProps {
  isLiked: boolean;
  likeCount: number;
  /** 좋아요 대상 VodAsset.id */
  vodId: number;
}

export default function RecordingLikeButton({
  isLiked,
  likeCount,
  vodId,
}: RecordingLikeButtonProps) {
  // 1) 로컬 소스 오브 트루스
  const [local, setLocal] = useState({ isLiked, likeCount });

  // 2) 상위 props가 바뀌면 동기화 (페이지 리프레시/SSR 갱신 대응)
  useEffect(() => {
    setLocal({ isLiked, likeCount });
  }, [isLiked, likeCount]);

  // 3) 중복 클릭 방지
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    if (isPending) return;

    const prev = local;
    const optimistic = {
      isLiked: !prev.isLiked,
      likeCount: prev.isLiked ? prev.likeCount - 1 : prev.likeCount + 1,
    };

    // 4) 낙관적 UI 즉시 반영
    setLocal(optimistic);

    // 5) 서버 반영 후 결과로 화해
    startTransition(async () => {
      try {
        // 낙관 상태 기준으로 어떤 액션을 호출할지 결정 (props가 아니라 local 기반!)
        const res = (
          optimistic.isLiked
            ? await likeRecording(vodId)
            : await dislikeRecording(vodId)
        ) as LikeResult;

        if (res && typeof res === "object" && "success" in res) {
          if (res.success) {
            // 서버가 즉시 상태/카운트를 반환하는 경우 → 서버 진실값으로 동기화
            setLocal({ isLiked: res.isLiked, likeCount: res.likeCount });
            toast.success(
              optimistic.isLiked
                ? "좋아요를 눌렀습니다."
                : "좋아요를 취소했습니다."
            );
          } else {
            // 서버 실패 → 롤백
            setLocal(prev);
            toast.error("오류가 발생했습니다. 다시 시도해주세요.");
          }
        } else {
          // 기존(무반환) 서버 액션: 낙관 상태 유지
          toast.success(
            optimistic.isLiked
              ? "좋아요를 눌렀습니다."
              : "좋아요를 취소했습니다."
          );
        }
      } catch {
        // 네트워크/예외 → 롤백
        setLocal(prev);
        toast.error("오류가 발생했습니다. 다시 시도해주세요.");
      }
    });
  };

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      aria-pressed={local.isLiked}
      className={`flex items-center gap-1 transition-colors ${
        local.isLiked ? "text-rose-500" : "text-neutral-400 hover:text-rose-500"
      } ${isPending ? "opacity-70 cursor-not-allowed" : ""}`}
    >
      {local.isLiked ? (
        <HeartIcon aria-label="heart" className="size-8" />
      ) : (
        <OutlineHeartIcon aria-label="heart_outline" className="size-8" />
      )}
      <span>{local.likeCount}</span>
    </button>
  );
}
