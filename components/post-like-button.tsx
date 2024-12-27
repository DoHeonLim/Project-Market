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
*/
"use client";

import { HeartIcon } from "@heroicons/react/24/solid";
import { HeartIcon as OutlineHeartIcon } from "@heroicons/react/24/outline";
import { useOptimistic } from "react";
import { dislikePost, likePost } from "@/app/posts/[id]/actions";

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
    reducerFn(undefined);
    if (isLiked) {
      await dislikePost(postId);
    } else {
      await likePost(postId);
    }
  };
  return (
    <button
      onClick={handleClick}
      className={`flex items-center gap-1 p-2 transition-colors
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
