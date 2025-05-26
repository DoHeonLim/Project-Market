/**
File Name : app/products/[id]/page
Description : 제품 상세 페이지
Author : 임도헌

History
Date        Author   Status    Description
2024.10.14  임도헌   Created
2024.10.14  임도헌   Modified  제품 상세 페이지 추가
2024.10.17  임도헌   Modified  이미지 object-cover로 변경
2024.10.17  임도헌   Modified  제품 삭제 기능 추가
2024.10.26  임도헌   Modified  메타데이터 추가
2024.11.02  임도헌   Modified  제품 삭제 버튼 편집 페이지로 옮김
2024.11.09  임도헌   Modified  제품 채팅방 생성 함수 추가
2024.11.11  임도헌   Modified  클라우드 플레어 이미지 variants 추가
2024.11.15  임도헌   Modified  본인이라면 채팅하기 버튼 필요 없으므로 코드 수정, 캐싱 기능 추가
2024.11.21  임도헌   Modified  Chatroom을 productChatRoom으로 변경
2024.12.05  임도헌   Modified  제품 상세 페이지 판매 여부 추가
2024.12.07  임도헌   Modified  프로필 이미지 컴포넌트 분리
2024.12.11  임도헌   Modified  제품 사진 캐러셀 추가
2024.12.11  임도헌   Modified  제품 좋아요 추가
2024.12.11  임도헌   Modified  뒤로가기 버튼 추가
2024.12.12  임도헌   Modified  제품 생성 시간 표시 변경
2024.12.14  임도헌   Modified  getProduct 함수 수정(조회수 증가)
2024.12.16  임도헌   Modified  제품 조회수 업데이트 함수 추가
2024.12.16  임도헌   Modified  제품 상세를 보드게임 제품 형식으로 변경
2024.12.17  임도헌   Modified  서버코드 모두 app/products/[id]/actions로 이동
2024.12.22  임도헌   Modified  채팅방 생성 함수 변경, 제품 캐싱 함수 변경
2024.12.25  임도헌   Modified  제품 상세 페이지 다크모드 추가
2024.12.25  임도헌   Modified  제품 상세 정보 컴포넌트 분리
2025.04.13  임도헌   Modified  completeness 필드를 영어로 변경
2025.04.13  임도헌   Modified  condition 필드를 영어로 변경
2025.04.13  임도헌   Modified  game_type 필드를 영어로 변경
*/

import db from "@/lib/db";
import { formatToWon } from "@/lib/utils";
import Link from "next/link";
import { notFound } from "next/navigation";
import UserAvatar from "@/components/common/UserAvatar";
import Carousel from "@/components/common/Carousel";
import ProductLikeButton from "@/components/product/ProductLikeButton";
import BackButton from "@/components/common/BackButton";
import TimeAgo from "@/components/common/TimeAgo";
import { EyeIcon } from "@heroicons/react/24/solid";
import {
  getCachedProduct,
  getCachedProductLikeStatus,
  getCachedProductTitle,
  getCachedProductWithViews,
  getIsOwner,
} from "./actions";
import ChatButton from "@/components/chat/ChatButton";
import ProductInfoItem from "@/components/product/ProductInfoItem";
import {
  COMPLETENESS_DISPLAY,
  CONDITION_DISPLAY,
  GAME_TYPE_DISPLAY,
} from "@/lib/constants";

export const dynamic = "force-dynamic";
export const revalidate = 0;
/**
 * 조회수 업데이트 중 오류 발생: n [Error]: Dynamic server usage: Route /products/2 couldn't be rendered statically because it used `revalidateTag product-views-2`
 * 이 에러는 Next.js에서 정적 페이지 생성(Static Site Generation, SSG) 중에 동적 기능을 사용하려고 할 때 발생하는 문제
구체적으로, /products/[id] 페이지에서 revalidateTag를 사용하여 조회수를 업데이트하려고 하는데, 이는 동적 기능이라 정적 생성과 충돌이 발생
페이지를 동적으로 렌더링하도록 설정
 */

export async function generateMetadata({ params }: { params: { id: string } }) {
  const product = await getCachedProductTitle(Number(params.id));
  return {
    title: product?.title,
  };
}

export default async function ProductDetail({
  params,
}: {
  params: { id: string };
}) {
  const id = Number(params.id);
  if (isNaN(id)) {
    return notFound();
  }
  const product = await getCachedProduct(id);
  if (!product) {
    return notFound();
  }
  const views = await getCachedProductWithViews(id);
  const isOwner = await getIsOwner(product.userId);
  const { likeCount, isLiked } = await getCachedProductLikeStatus(id);

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-900 pb-10">
      <BackButton className="p-4" />
      <div className="mb-24 mx-auto overflow-hidden">
        {/* 이미지 캐러셀 */}
        <div className="w-full h-[300px] relative">
          <Carousel images={product.images} className="w-full h-full" />
          <div className="absolute top-4 right-4 flex items-center gap-1 px-2 py-1 bg-black/50 rounded-full text-white text-sm">
            <EyeIcon className="size-4" />
            <span>{views}</span>
          </div>
        </div>

        {/* 판매자 정보 */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50">
          <div className="flex items-center gap-2">
            <span className="text-sm text-neutral-500">⚓ 판매 선원</span>
            <div className="flex items-center gap-3">
              <UserAvatar
                avatar={product.user.avatar}
                username={product.user.username}
                size="md"
              />
            </div>
          </div>
          <TimeAgo date={product.created_at.toString()} />
        </div>

        {/* 제품 정보 */}
        <div className="p-4 space-y-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Link
                href={`/search/products?game_type=${product.game_type}`}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-primary/10 text-primary dark:bg-primary-light/10 dark:text-primary-light rounded-full hover:bg-primary/20 dark:hover:bg-primary-light/20 transition-all hover:scale-105 active:scale-95"
              >
                🎲{" "}
                {
                  GAME_TYPE_DISPLAY[
                    product.game_type as keyof typeof GAME_TYPE_DISPLAY
                  ]
                }
              </Link>
            </div>
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-text dark:text-text-dark">
                🎲 {product.title}
              </h1>
              <span className="text-lg font-bold text-accent dark:text-accent-light">
                💰 {formatToWon(product.price)}원
              </span>
            </div>
          </div>

          {/* 제품 상태 정보 */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg border border-neutral-200 dark:border-neutral-700">
            <ProductInfoItem
              label="📁 카테고리"
              value={
                <span className="flex items-center gap-2">
                  {product.category.parent && (
                    <>
                      <span>
                        {product.category.parent.icon}{" "}
                        {product.category.parent.kor_name}
                      </span>
                      <span className="text-neutral-400">&gt;</span>
                    </>
                  )}
                  <span>
                    {product.category.icon} {product.category.kor_name}
                  </span>
                </span>
              }
            />
            <ProductInfoItem
              label="🎮 게임 인원"
              value={`${product.min_players} - ${product.max_players}명`}
            />
            <ProductInfoItem label="⌛ 플레이 시간" value={product.play_time} />
            <ProductInfoItem
              label="📦 제품 상태"
              value={
                CONDITION_DISPLAY[
                  product.condition as keyof typeof CONDITION_DISPLAY
                ]
              }
            />
            <ProductInfoItem
              label="🧩 구성품 상태"
              value={
                COMPLETENESS_DISPLAY[
                  product.completeness as keyof typeof COMPLETENESS_DISPLAY
                ]
              }
            />
            <ProductInfoItem
              label="📖 설명서"
              value={product.has_manual ? "✅ 포함" : "❌ 미포함"}
            />
          </div>

          {/* 태그 섹션 */}
          {product.search_tags.length > 0 && (
            <div className="flex flex-wrap gap-2 py-4 border-y dark:border-neutral-700">
              {product.search_tags.map((tag, index) => (
                <Link
                  key={index}
                  href={`/products?keyword=${tag.name}`}
                  className="px-3 py-1 text-sm bg-primary/10 text-primary dark:bg-primary-light/10 dark:text-primary-light rounded-full hover:bg-primary/20 dark:hover:bg-primary-light/20 transition-colors"
                >
                  🏷️ {tag.name}
                </Link>
              ))}
            </div>
          )}

          {/* 제품 설명 */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
              📝 상세 설명
            </h3>
            <p className="whitespace-pre-wrap text-text dark:text-text-dark text-sm">
              {product.description}
            </p>
          </div>
        </div>

        {/* 하단 고정 액션 바 */}
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 flex items-center justify-between w-full max-w-screen-sm px-5 py-2 bg-white dark:bg-neutral-800 border-t dark:border-neutral-700 backdrop-blur-lg">
          <div className="flex items-center gap-3">
            <ProductLikeButton
              isLiked={isLiked}
              likeCount={likeCount}
              productId={id}
            />
            {product.reservation_userId && product.purchase_userId ? (
              <span className="px-3 py-1 text-sm font-medium bg-neutral-500 text-white rounded-full">
                ⚓ 판매완료
              </span>
            ) : product.reservation_userId ? (
              <span className="px-3 py-1 text-sm font-medium bg-green-500 text-white rounded-full">
                🛞 예약중
              </span>
            ) : null}
          </div>

          <div className="flex gap-3">
            {isOwner ? (
              <Link
                href={`/products/${id}/edit`}
                className="px-4 py-2 rounded-md text-white font-medium bg-primary hover:bg-primary/90 transition-colors text-sm flex items-center gap-2"
              >
                ⚙️ 수정하기
              </Link>
            ) : (
              <ChatButton id={id} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export async function generateStaticParams() {
  const products = await db.product.findMany({
    select: {
      id: true,
    },
  });
  return products.map((product) => ({ id: product.id + "" }));
}
