/**
File Name : components/product/ProductCardMeta
Description : 조회수, 좋아요, 생성일 등 제품 메타 정보 표시 컴포넌트
Author : 임도헌

History
Date        Author   Status    Description
2025.06.07  임도헌   Created   제품 메타 정보 분리
*/

"use client";

import { EyeIcon, HeartIcon } from "@heroicons/react/24/solid";
import TimeAgo from "@/components/common/TimeAgo";

interface ProductCardMetaProps {
  views: number;
  likes: number;
  createdAt: Date | string;
}

export default function ProductCardMeta({
  views,
  likes,
  createdAt,
}: ProductCardMetaProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
      <div className="flex items-center gap-1 text-neutral-500 dark:text-neutral-400">
        <EyeIcon className="size-3 sm:size-4" />
        <span>{views}</span>
      </div>
      <div className="flex items-center gap-1">
        <HeartIcon className="size-3 sm:size-4 text-rose-600" />
        <span className="text-neutral-500 dark:text-neutral-400">{likes}</span>
      </div>
      <TimeAgo date={createdAt.toString()} />
    </div>
  );
}
