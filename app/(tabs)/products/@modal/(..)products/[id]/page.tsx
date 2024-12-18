/**
 File Name : app/(tabs)/products/@modal/(...)products.[id]/page
 Description : products/[id] 인터셉트 후 모달 페이지
 Author : 임도헌
 
 History
 Date        Author   Status    Description
 2024.10.22  임도헌   Created
 2024.10.22  임도헌   Modified  모달 페이지 추가(페러렐 라우트)
 2024.11.02  임도헌   Modified  제품 삭제 버튼 편집 페이지로 옮김
 2024.11.08  임도헌   Modified  채팅방 생성 함수 추가
 2024.11.11  임도헌   Modified  클라우드 플레어 이미지 variants 추가
 2024.11.15  임도헌   Modified  본인이라면 채팅하기 버튼 필요 없으므로 코드 수정
 2024.11.21  임도헌   Modified  Chatroom을 productChatRoom으로 변경
 2024.11.21  임도헌   Modified  제품 제목이나 내용이 길어질 경우 창이 커지는 것 수정
 2024.12.05  임도헌   Modified  제품 상세 페이지 판매 여부 추가
 2024.12.07  임도헌   Modified  프로필 이미지 컴포넌트 분리
 2024.12.12  임도헌   Modified  제품 이미지 캐러셀로 변경
 2024.12.12  임도헌   Modified  제품 생성 시간 표시 변경
 2024.12.15  임도헌   Modified  보드포트 컨셉으로 스타일 변경
 2024.12.16  임도헌   Modified  제품 조회수 추가
 2024.12.17  임도헌   Modified  서버코드 모두 app/products/[id]/actions로 이동
 */

import CloseButton from "@/components/close-button";
import UserAvatar from "@/components/user-avatar";
import { formatToWon } from "@/lib/utils";
import Link from "next/link";
import { notFound } from "next/navigation";
import Carousel from "@/components/carousel";
import ProductLikeButton from "@/components/product-like-button";
import TimeAgo from "@/components/time-ago";
import { EyeIcon } from "@heroicons/react/24/solid";
import {
  createChatRoom,
  getCachedProduct,
  getCachedProductLikeStatus,
  getCachedProductWithViews,
  getIsOwner,
} from "@/app/products/[id]/actions";

export default async function Modal({
  params,
}: {
  params: {
    id: string;
  };
}) {
  // 제품 아이디
  const id = Number(params.id);
  if (isNaN(id)) {
    return notFound();
  }
  // 제품 정보
  const product = await getCachedProduct(id);
  if (!product) {
    return notFound();
  }
  const views = await getCachedProductWithViews(id);
  const isOwner = await getIsOwner(product.userId);
  const { likeCount, isLiked } = await getCachedProductLikeStatus(id);

  return (
    <div className="fixed top-0 left-0 z-50 flex items-center justify-center w-full h-full bg-black/60">
      <CloseButton />
      <div className="flex flex-col w-full max-w-2xl bg-white dark:bg-neutral-800 rounded-lg overflow-hidden max-h-[90vh]">
        {/* 이미지 캐러셀 - 높이 제한 추가 */}
        <div className="w-full h-[300px]">
          <Carousel images={product.images} className="w-full h-full" />
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* 판매자 정보 */}
          <div className="flex items-center justify-between p-4 border-b dark:border-neutral-700">
            <UserAvatar
              avatar={product.user.avatar}
              username={product.user.username}
              size="md"
            />
            <TimeAgo date={product.created_at.toString()} />
          </div>

          {/* 제품 정보 */}
          <div className="p-4 space-y-4">
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

            {/* 제품 설명 */}
            <div className="space-y-2">
              <h3 className="text-sm text-neutral-500 dark:text-neutral-400">
                상세 설명
              </h3>
              <p className="whitespace-pre-wrap dark:text-white text-sm">
                {product.description}
              </p>
            </div>
          </div>
        </div>

        {/* 하단 고정 액션 바 */}
        <div className="border-t dark:border-neutral-700 p-4 bg-white dark:bg-neutral-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ProductLikeButton
                isLiked={isLiked}
                likeCount={likeCount}
                productId={id}
              />
              {product.reservation_userId && product.purchase_userId ? (
                <span className="px-2 py-1 text-sm font-medium bg-neutral-500 text-white rounded-full">
                  판매완료
                </span>
              ) : product.reservation_userId ? (
                <span className="px-2 py-1 text-sm font-medium bg-green-500 text-white rounded-full">
                  예약중
                </span>
              ) : null}
            </div>

            <div className="flex gap-3">
              {isOwner ? (
                <Link
                  href={`/products/${id}/edit`}
                  className="px-4 py-2 rounded-md text-white font-medium bg-rose-600 hover:bg-rose-500 transition-colors text-sm"
                >
                  수정하기
                </Link>
              ) : (
                <form action={() => createChatRoom(id)}>
                  <button className="px-4 py-2 font-medium text-white bg-primary hover:bg-primary/90 rounded-md transition-colors text-sm">
                    채팅하기
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
