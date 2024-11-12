/**
File Name : components/button
Description : 좋아요 버튼 컴포넌트
Author : 임도헌

History
Date        Author   Status    Description
2024.11.01  임도헌   Created
2024.11.01  임도헌   Modified  좋아요 버튼 추가
2024.11.06  임도헌   Modified  useOptimistic에 payload 사용하지 않아서 삭제
*/
"use client";

import { HandThumbUpIcon } from "@heroicons/react/24/solid";
import { HandThumbUpIcon as OutlineHandThumbUpIcon } from "@heroicons/react/24/outline";
import { useOptimistic } from "react";
import { dislikePost, likePost } from "@/app/posts/[id]/actions";

interface ILikeButtonProps {
  isLiked: boolean;
  likeCount: number;
  postId: number;
}

export default function LikeButton({
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
      className={`flex items-center gap-2 text-neutral-400
        text-sm border border-neutral-400 rounded-full p-2 transition-colors
        ${
          state.isLiked
            ? "bg-indigo-500 text-white border-indigo-500 hover:bg-neutral-800"
            : "hover:bg-indigo-500 hover:text-white hover:border-indigo-500"
        }`}
    >
      {state.isLiked ? (
        <HandThumbUpIcon className="size-5" />
      ) : (
        <OutlineHandThumbUpIcon className="size-5" />
      )}
      <span>
        {state.isLiked ? "취소하기" : "공감하기"} ({state.likeCount})
      </span>
    </button>
  );
}
