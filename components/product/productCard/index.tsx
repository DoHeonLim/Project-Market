/**
File Name : components/product/index
Description : 개별 제품 카드 UI를 구성하는 세부 컴포넌트 모음
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
2025.06.07  임도헌   Modified  ListProduct에서 ProductCard로 이름 변경
2025.06.07  임도헌   Modified  제품 카드 UI 컴포넌트 분리 및 모듈화


* 이 폴더는 ProductCard (구 ListProduct) 컴포넌트를 구성하는 UI 요소들을 분리해 모아둔 디렉토리입니다.
 * 각 컴포넌트는 제품 정보를 보여주는 카드에서 특정 부분의 렌더링을 담당합니다:
 *
 * - ProductCardHeader.tsx : 게임 타입 및 카테고리 경로 표시
 * - ProductCardTitle.tsx : 제품 제목 표시
 * - ProductCardPrice.tsx : 가격 및 판매/예약 상태 뱃지
 * - ProductCardMeta.tsx : 조회수, 좋아요 수, 작성 시간
 * - ProductCardTags.tsx : 제품 관련 태그 목록
 * - ProductCardThumbnail.tsx : 대표 이미지 및 오버레이 렌더링
 * - index.tsx : 위 컴포넌트들을 조합한 최종 ProductCard
 */
import Link from "next/link";
import ProductCardThumbnail from "./ProductCardThumbnail";
import { ProductCardHeader } from "./ProductCardHeader";
import { ProductCardTitle } from "./ProductCardTitle";
import ProductCardPrice from "./ProductCardPrice";
import ProductCardMeta from "./ProductCardMeta";
import { ProductCardTags } from "./ProductCardTags";
import type { ProductCardProps } from "@/types/product";
import { usePathname, useSearchParams } from "next/navigation";

export default function ProductCard({
  product,
  viewMode,
  isPriority,
}: ProductCardProps) {
  const {
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
  } = product;

  const pathname = usePathname();
  const sp = useSearchParams();
  const next = pathname + (sp.size ? `?${sp.toString()}` : "");
  const href = `/products/view/${id}?returnTo=${encodeURIComponent(next)}`;

  return (
    <Link
      href={href}
      className={`${
        viewMode === "grid"
          ? "flex flex-col h-full p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-neutral-100/50 dark:hover:bg-neutral-800/50 hover:shadow-lg transition-all group"
          : "flex flex-row gap-4 p-4 border-b border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100/50 dark:hover:bg-neutral-800/50 transition-all group"
      }`}
    >
      {/* 제품 썸네일 */}
      <ProductCardThumbnail
        imageUrl={images[0]?.url}
        viewMode={viewMode}
        isPriority={isPriority}
        reservation_userId={reservation_userId}
        purchase_userId={purchase_userId}
        title={title}
      />
      <div
        className={`flex flex-col gap-2 ${viewMode === "grid" ? "mt-3" : "flex-1"}`}
      >
        {/* 게임 타입 및 카테고리 정보 */}
        <ProductCardHeader gameType={game_type} category={category} />
        {/* 제품 제목 */}
        <ProductCardTitle title={title} viewMode={viewMode} />
        {/* 제품 가격 */}
        <ProductCardPrice
          price={price}
          reservation_userId={reservation_userId}
          purchase_userId={purchase_userId}
        />
        {/* 제품 조회수 좋아요, 생성일 */}
        <div className="flex flex-col gap-2">
          <ProductCardMeta
            views={views}
            likes={_count.product_likes}
            createdAt={created_at}
          />
          {/* 제품 태그 */}
          <ProductCardTags tags={search_tags} />
        </div>
      </div>
    </Link>
  );
}
