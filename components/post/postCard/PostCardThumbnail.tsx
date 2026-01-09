/**
 * File Name : components/post/postCard/PostCardThumbnail
 * Description : 게시글 썸네일 이미지
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2025.07.04  임도헌   Created   썸네일 분리
 */

"use client";

import Image from "next/image";
import { PhotoIcon } from "@heroicons/react/24/solid";

interface PostCardThumbnailProps {
  images: { url: string }[];
  viewMode: "list" | "grid";
}

export default function PostCardThumbnail({
  images,
  viewMode,
}: PostCardThumbnailProps) {
  const isGrid = viewMode === "grid";

  return (
    <div
      className={`relative overflow-hidden rounded-lg ${
        isGrid ? "aspect-square w-full" : "size-24 sm:size-32 flex-shrink-0"
      }`}
    >
      {images[0] ? (
        <Image
          src={`${images[0].url}/public`}
          alt="post-image"
          fill
          sizes={
            isGrid
              ? "(max-width: 640px) 100vw, (max-width: 768px) 50vw"
              : "128px"
          }
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
      ) : (
        <div className="flex items-center justify-center w-full h-full bg-neutral-100 dark:bg-neutral-700">
          <PhotoIcon className="w-8 h-8 text-neutral-400" />
        </div>
      )}
    </div>
  );
}
