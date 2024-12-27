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
*/

import { formatToWon } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import TimeAgo from "./time-ago";
import { EyeIcon, HeartIcon } from "@heroicons/react/24/solid";

interface IListProductProps {
  title: string;
  price: number;
  created_at: Date;
  images: { url: string }[];
  id: number;
  reservation_userId: number | null;
  purchase_userId: number | null;
  category: {
    name: string | null;
    icon: string | null;
    parent: {
      name: string | null;
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
}: IListProductProps) {
  const thumbnailUrl = `${images[0]?.url}/public`;

  return (
    <Link
      href={`/products/${id}`}
      className="flex gap-5 p-4 border-b border-neutral-300 dark:border-neutral-600 hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50 hover:rounded-md hover:scale-[1.02] transition-all group"
    >
      <div className="relative overflow-hidden rounded-md size-28 group-hover:shadow-lg transition-shadow">
        <Image
          fill
          src={thumbnailUrl}
          sizes="(max-width: 768px) 112px, 112px"
          className="object-cover transform group-hover:scale-105 transition-transform duration-300"
          alt={title}
        />
        {(reservation_userId || purchase_userId) && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="text-white font-bold">
              {purchase_userId ? "⚓ 판매완료" : "🎯 예약중"}
            </span>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-2 justify-center flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm text-primary dark:text-primary-light font-medium">
            🎲 {game_type}
          </span>
          <span className="text-sm text-neutral-600 dark:text-neutral-400">
            |
          </span>
          {category && (
            <span className="text-sm text-neutral-600 dark:text-neutral-400">
              {category.parent?.icon} {category.parent?.name} &gt;{" "}
              {category.icon} {category.name}
            </span>
          )}
        </div>
        <h3 className="text-lg font-semibold text-text dark:text-text-dark group-hover:text-primary dark:group-hover:text-primary-light transition-colors">
          {title}
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-accent dark:text-accent-light">
            💰 {formatToWon(price)}원
          </span>
          {purchase_userId && (
            <span className="px-2 py-1 text-sm font-medium bg-neutral-500 text-white rounded-full">
              ⚓ 판매완료
            </span>
          )}
          {reservation_userId && !purchase_userId && (
            <span className="px-2 py-1 text-sm font-medium bg-green-500 text-white rounded-full">
              🛞 예약중
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <div className="flex items-center gap-1 text-neutral-500 dark:text-neutral-400">
            <EyeIcon className="size-4" />
            <span>{views}</span>
          </div>
          <div className="flex items-center gap-1">
            <HeartIcon className="size-4 text-rose-600" />
            <span className="text-neutral-500 dark:text-neutral-400">
              {_count.product_likes}
            </span>
          </div>
          <TimeAgo date={created_at.toString()} />
          {search_tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {search_tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-0.5 text-xs bg-primary/10 text-primary dark:bg-primary-light/10 dark:text-primary-light rounded-full"
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
