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
*/

import db from "@/lib/db";
import { formatToWon } from "@/lib/utils";
import Link from "next/link";
import { notFound } from "next/navigation";
import UserAvatar from "@/components/user-avatar";
import Carousel from "@/components/carousel";
import ProductLikeButton from "@/components/product-like-button";
import BackButton from "@/components/back-button";
import TimeAgo from "@/components/time-ago";
import { EyeIcon } from "@heroicons/react/24/solid";
import {
  getCachedProduct,
  getCachedProductLikeStatus,
  getCachedProductTitle,
  getCachedProductWithViews,
  getIsOwner,
  createChatRoom,
} from "./actions";

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
      <div className="mb-24 max-w-4xl mx-auto overflow-hidden">
        <div className="w-full h-[300px]">
          <Carousel images={product.images} className="w-full h-full" />
        </div>

        {/* 판매자 정보 섹션 */}
        <div className="flex items-center justify-between p-5 border-b dark:border-neutral-700">
          <div className="flex items-center gap-3">
            <UserAvatar
              avatar={product.user.avatar}
              username={product.user.username}
              size="md"
            />
          </div>
          <TimeAgo date={product.created_at?.toString()} />
        </div>

        {/* 제품 정보 섹션 */}
        <div className="p-5 space-y-4 overflow-y-auto">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold dark:text-white">
              {product.title}
            </h1>
            <div className="flex items-center gap-2">
              <span className="text-xl font-semibold text-primary">
                {formatToWon(product.price)}원
              </span>
              <div className="flex items-center gap-1 text-sm text-neutral-500 dark:text-neutral-400">
                <EyeIcon className="size-4" />
                <span>{views}</span>
              </div>
            </div>
          </div>

          {/* 제품 상태 정보 */}
          <div className="grid grid-cols-2 gap-4 py-4 border-y dark:border-neutral-700">
            <div className="space-y-1">
              <h3 className="text-sm text-neutral-500 dark:text-neutral-400">
                카테고리
              </h3>
              <p className="dark:text-white flex items-center gap-2">
                {product.category.parent && (
                  <>
                    <span>
                      {product.category.parent.icon}
                      {product.category.parent.name}
                    </span>
                    <span className="text-neutral-400">&gt;</span>
                  </>
                )}
                <span>
                  {product.category.icon} {product.category.name}
                </span>
              </p>
            </div>
            <div className="space-y-1">
              <h3 className="text-sm text-neutral-500 dark:text-neutral-400">
                제품 상태
              </h3>
              <p className="dark:text-white">{product.condition}</p>
            </div>

            <div className="space-y-1">
              <h3 className="text-sm text-neutral-500 dark:text-neutral-400">
                게임 인원
              </h3>
              <p className="dark:text-white">
                {product.min_players} - {product.max_players}명
              </p>
            </div>

            <div className="space-y-1">
              <h3 className="text-sm text-neutral-500 dark:text-neutral-400">
                구성품 상태
              </h3>
              <p className="dark:text-white">{product.completeness}</p>
            </div>
            <div className="space-y-1">
              <h3 className="text-sm text-neutral-500 dark:text-neutral-400">
                플레이 시간
              </h3>
              <p className="dark:text-white">{product.play_time}</p>
            </div>
            <div className="space-y-1">
              <h3 className="text-sm text-neutral-500 dark:text-neutral-400">
                설명서 포함
              </h3>
              <p className="dark:text-white">
                {product.has_manual ? "⭕" : "❌"}
              </p>
            </div>
          </div>
          {/* 태그 섹션 */}
          {product.search_tags.length > 0 && (
            <div className="flex flex-wrap gap-2 border-b dark:border-neutral-700 pb-4">
              {product.search_tags.map((tag, index) => (
                <Link
                  key={index}
                  href={`/search/products?keyword=${tag.name}`}
                  className="px-3 py-1 text-sm bg-primary/10 text-primary rounded-full hover:bg-primary/20 transition-colors"
                >
                  #{tag.name}
                </Link>
              ))}
            </div>
          )}

          {/* 제품 설명 */}
          <div className="space-y-2">
            <h3 className="text-sm text-neutral-500 dark:text-neutral-400">
              상세 설명
            </h3>
            <p className="whitespace-pre-wrap dark:text-white">
              {product.description}
            </p>
          </div>
        </div>

        {/* 하단 고정 액션 바 */}
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 flex items-center justify-between w-full max-w-screen-sm px-5 py-2 bg-white dark:bg-neutral-800 border-t dark:border-neutral-700">
          <div className="flex items-center gap-4">
            <ProductLikeButton
              isLiked={isLiked}
              likeCount={likeCount}
              productId={id}
            />
            {product.reservation_userId && product.purchase_userId ? (
              <span className="px-3 py-1 text-sm font-medium bg-neutral-500 text-white rounded-full">
                판매완료
              </span>
            ) : product.reservation_userId ? (
              <span className="px-3 py-1 text-sm font-medium bg-green-500 text-white rounded-full">
                예약중
              </span>
            ) : null}
          </div>

          <div className="flex gap-3">
            {isOwner ? (
              <Link
                href={`/products/${id}/edit`}
                className="px-5 py-2.5 rounded-md text-white font-medium bg-rose-600 hover:bg-rose-500 transition-colors"
              >
                수정하기
              </Link>
            ) : (
              <form action={() => createChatRoom(id)}>
                <button className="px-5 py-2.5 font-medium text-white bg-primary hover:bg-primary/90 rounded-md transition-colors">
                  채팅하기
                </button>
              </form>
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
