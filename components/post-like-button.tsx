/**
File Name : components/post-like-button.tsx
Description : 게시글 좋아요 버튼 컴포넌트
Author : 임도헌

History
Date        Author   Status    Description
2024.11.01  임도헌   Created
2024.11.01  임도헌   Modified  좋아요 버튼 추가
2024.11.06  임도헌   Modified  useOptimistic에 payload 사용하지 않아서 삭제
2024.12.18  임도헌   Modified  sm:hidden 추가(모바일 반응형 추가)
2024.12.24  임도헌   Modified  좋아요 버튼 아이콘 변경
2025.05.10  임도헌   Modified  startTransition을 사용한 성능 최적화
*/
"use client";

import { HeartIcon } from "@heroicons/react/24/solid";
import { HeartIcon as OutlineHeartIcon } from "@heroicons/react/24/outline";
import { useOptimistic, startTransition } from "react";
import { dislikePost, likePost } from "@/app/posts/[id]/actions";
import { toast } from "sonner";

interface ILikeButtonProps {
  isLiked: boolean;
  likeCount: number;
  postId: number;
}

export default function PostLikeButton({
  isLiked,
  likeCount,
  postId,
}: ILikeButtonProps) {
  const [state, reducerFn] = useOptimistic(
    { isLiked, likeCount },
    (previousState) => ({
      isLiked: !previousState.isLiked,
      likeCount: previousState.isLiked
        ? previousState.likeCount - 1
        : previousState.likeCount + 1,
    })
  );

  const handleClick = async () => {
    startTransition(() => {
      reducerFn(undefined);
    });

    try {
      if (isLiked) {
        await dislikePost(postId);
        toast.success("좋아요를 취소했습니다.");
      } else {
        await likePost(postId);
        toast.success("좋아요를 눌렀습니다.");
      }
    } catch {
      toast.error("오류가 발생했습니다. 다시 시도해주세요.");
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`flex items-center gap-1 transition-colors
        ${
          state.isLiked
            ? "text-rose-500"
            : "text-neutral-400 hover:text-rose-500"
        }`}
    >
      {state.isLiked ? (
        <HeartIcon aria-label="heart" className="size-10" />
      ) : (
        <OutlineHeartIcon aria-label="heart_outline" className="size-10" />
      )}
      <span>{state.likeCount}</span>
    </button>
  );
}
