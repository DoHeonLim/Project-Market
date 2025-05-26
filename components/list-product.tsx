/**
File Name : components/list-product
Description : 제품 컴포넌트
Author : 임도헌

History
Date        Author   Status    Description
2024.10.14  임도헌   Created
2024.10.14  임도헌   Modified  제품 컴포넌트 추가
2024.10.17  임도헌   Modified  이미지 object-cover로 변경
2024.11.02  임도헌   Modified  콘솔에 뜨는 Image에러 size 추가
2024.11.11  임도헌   Modified  클라우드 플레어 이미지 variants 추가
2024.12.07  임도헌   Modified  제품 판매 여부 추가
2024.12.11  임도헌   Modified  제품 대표 이미지로 변경
2024.12.11  임도헌   Modified  제품 마우스 오버 시 애니메이션 추가
2024.12.15  임도헌   Modified  제품 카테고리 추가
2024.12.15  임도헌   Modified  제품 조회수 추가
2024.12.16  임도헌   Modified  제품 좋아요 추가
2024.12.16  임도헌   Modified  제품 태그 추가
2024.12.16  임도헌   Modified  제품 게임 타입 추가
2024.12.24  임도헌   Modified  스타일 수정
2025.05.06  임도헌   Modified  그리드, 리스트 뷰 기능 추가
2025.05.23  임도헌   Modified  카테고리 필드명 변경(name->kor_name)
*/

import { formatToWon } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import TimeAgo from "./time-ago";
import { EyeIcon, HeartIcon } from "@heroicons/react/24/solid";
import { GAME_TYPE_DISPLAY } from "@/lib/constants";

interface IListProductProps {
  title: string;
  price: number;
  created_at: Date;
  images: { url: string }[];
  id: number;
  reservation_userId: number | null;
  purchase_userId: number | null;
  category: {
    kor_name: string | null;
    icon: string | null;
    parent: {
      kor_name: string | null;
      icon: string | null;
    } | null;
  } | null;
  views: number;
  game_type: string;
  _count: {
    product_likes: number;
  };
  search_tags: {
    name: string;
  }[];
  viewMode: "grid" | "list";
  isPriority?: boolean;
}

export default function ListProduct({
  title,
  price,
  created_at,
  images,
  id,
  reservation_userId,
  purchase_userId,
  category,
  views,
  game_type,
  _count,
  search_tags,
  viewMode,
  isPriority,
}: IListProductProps) {
  const thumbnailUrl = `${images[0]?.url}/public`;

  return (
    <Link
      href={`/products/${id}`}
      className={`${
        viewMode === "grid"
          ? "flex flex-col h-full p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-neutral-100/50 dark:hover:bg-neutral-800/50 hover:shadow-lg transition-all group"
          : "flex flex-row gap-4 p-4 border-b border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100/50 dark:hover:bg-neutral-800/50 transition-all group"
      }`}
    >
      <div
        className={`relative overflow-hidden rounded-lg ${
          viewMode === "grid" ? "aspect-square w-full" : "size-28 flex-shrink-0"
        } group-hover:shadow-lg transition-shadow`}
      >
        <Image
          fill
          src={thumbnailUrl}
          priority={isPriority}
          sizes={
            viewMode === "grid"
              ? "(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              : "112px"
          }
          className="object-cover transform group-hover:scale-105 transition-transform duration-300"
          alt={title}
        />
        {(reservation_userId || purchase_userId) && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="text-white font-bold text-sm sm:text-base">
              {purchase_userId ? "⚓ 판매완료" : "🛞 예약중"}
            </span>
          </div>
        )}
      </div>
      <div
        className={`flex flex-col gap-2 ${
          viewMode === "grid" ? "mt-3" : "flex-1"
        }`}
      >
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs sm:text-sm text-primary dark:text-primary-light font-medium">
            🎲 {GAME_TYPE_DISPLAY[game_type as keyof typeof GAME_TYPE_DISPLAY]}
          </span>
          {category && (
            <>
              <span className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
                |
              </span>
              <span className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 line-clamp-1">
                {category.parent?.icon} {category.parent?.kor_name} &gt;{" "}
                {category.icon} {category.kor_name}
              </span>
            </>
          )}
        </div>
        <h3
          className={`font-semibold text-text dark:text-text-dark group-hover:text-primary dark:group-hover:text-primary-light transition-colors ${
            viewMode === "grid"
              ? "text-sm sm:text-base line-clamp-2"
              : "text-base sm:text-lg line-clamp-1"
          }`}
        >
          {title}
        </h3>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-base sm:text-lg font-bold text-accent dark:text-accent-light">
            💰 {formatToWon(price)}원
          </span>
          {purchase_userId && (
            <span className="px-2 py-0.5 text-xs sm:text-sm font-medium bg-neutral-500 text-white rounded-full">
              ⚓ 판매완료
            </span>
          )}
          {reservation_userId && !purchase_userId && (
            <span className="px-2 py-0.5 text-xs sm:text-sm font-medium bg-green-500 text-white rounded-full">
              🛞 예약중
            </span>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
            <div className="flex items-center gap-1 text-neutral-500 dark:text-neutral-400">
              <EyeIcon className="size-3 sm:size-4" />
              <span>{views}</span>
            </div>
            <div className="flex items-center gap-1">
              <HeartIcon className="size-3 sm:size-4 text-rose-600" />
              <span className="text-neutral-500 dark:text-neutral-400">
                {_count.product_likes}
              </span>
            </div>
            <TimeAgo date={created_at.toString()} />
          </div>
          {search_tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {search_tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-1.5 py-0.5 text-[10px] sm:text-xs bg-primary/10 text-primary dark:bg-primary-light/10 dark:text-primary-light rounded-full"
                >
                  🏷️ {tag.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
