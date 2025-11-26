/**
 * File Name : components/profile/UserProfile
 * Description : 다른 유저 프로필 컴포넌트(채널과 동일한 팔로우 UX로 통일)
 * Author : 임도헌
 *
 * History
 * Date        Author   Status     Description
 * 2024.12.07  임도헌   Created
 * 2024.12.07  임도헌   Modified   다른 유저 프로필 페이지 추가
 * 2024.12.07  임도헌   Modified   무한 스크롤 추가
 * 2024.12.07  임도헌   Modified   평균 평점 및 갯수 로직 수정
 * 2024.12.12  임도헌   Modified   photo속성에서 images로 변경
 * 2024.12.22  임도헌   Modified   제품 모델 변경에 따른 제품 타입 변경
 * 2024.12.29  임도헌   Modified   다른 유저 프로필 컴포넌트 스타일 수정
 * 2025.04.18  임도헌   Modified   유저 뱃지 기능 추가
 * 2025.05.06  임도헌   Modified   그리드/리스트 뷰 모드 추가
 * 2025.05.22  임도헌   Modified   팔로우 기능 추가
 * 2025.10.08  임도헌   Modified   useFollowToggle 도입, FollowListModal 지연 로드/무한 스크롤/Set 동기화(채널과 동일)
 * 2025.10.12  임도헌   Modified   viewerFollowingIds/Set 제거, useFollowPagination 적용, 모달 간 동기화 상향 콜백으로 통일
 * 2025.10.14  임도헌   Modified   FollowSection 도입: 팔로우/모달/페이지네이션 로직 제거
 * 2025.10.17  임도헌   Modified   useProductPagination(profile) + useInfiniteScroll/usePageVisibility 적용
 * 2025.10.22  임도헌   Modified   viewerInfo prop 제거(개인화 최소화 유지, 낙관 표시용은 클라 훅에서 해결)
 * 2025.11.12  임도헌   Modified  MyProfile UI와 통일(섹션 헤더/btn-ghost/타일)
 * 2025.11.26  임도헌   Modified  방송국 섹션에 StreamCard 추가
 */

"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

import ProfileHeader from "./ProfileHeader";
import ProfileReviewsModal from "./ProfileReviewsModal";
import UserBadges from "./UserBadges";
import ProductCard from "../product/productCard";
import StreamCard from "../stream/StreamCard";
import { ListBulletIcon, Squares2X2Icon } from "@heroicons/react/24/outline";

import type { Paginated, ProductType, ViewMode } from "@/types/product";
import type {
  Badge,
  ProfileAverageRating,
  ProfileReview,
  UserProfile as UserProfileType,
} from "@/types/profile";
import type { BroadcastSummary } from "@/types/stream";

import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { usePageVisibility } from "@/hooks/usePageVisibility";
import { useProductPagination } from "@/hooks/useProductPagination";

type ProductStatus = "selling" | "sold";

interface Props {
  user: UserProfileType & { isFollowing?: boolean };
  initialReviews: ProfileReview[];
  initialSellingProducts: Paginated<ProductType>;
  initialSoldProducts: Paginated<ProductType>;
  averageRating: ProfileAverageRating | null;
  userBadges: Badge[];
  myStreams?: BroadcastSummary[];
  viewerId?: number;
}

export default function UserProfile({
  user,
  initialReviews,
  initialSellingProducts,
  initialSoldProducts,
  averageRating,
  userBadges,
  myStreams,
  viewerId,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const next = useMemo(
    () => pathname + (searchParams.size ? `?${searchParams.toString()}` : ""),
    [pathname, searchParams]
  );

  // 뷰/탭/모달
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [activeTab, setActiveTab] = useState<ProductStatus>("selling");
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  // 탭별 페이지네이션 훅 (profile 모드)
  const selling = useProductPagination<ProductType>({
    mode: "profile",
    scope: { type: "SELLING", userId: user.id },
    initialProducts: initialSellingProducts.products,
    initialCursor: initialSellingProducts.nextCursor,
  });
  const sold = useProductPagination<ProductType>({
    mode: "profile",
    scope: { type: "SOLD", userId: user.id },
    initialProducts: initialSoldProducts.products,
    initialCursor: initialSoldProducts.nextCursor,
  });

  const current = activeTab === "selling" ? selling : sold;
  const currentProducts = current.products as ProductType[];

  // 무한스크롤
  const triggerRef = useRef<HTMLButtonElement>(null);
  const isVisible = usePageVisibility();
  useInfiniteScroll({
    triggerRef,
    hasMore: current.hasMore,
    isLoading: current.isLoading,
    onLoadMore: current.loadMore,
    enabled: isVisible,
    rootMargin: "1400px 0px 0px 0px",
    threshold: 0.01,
  });

  return (
    <div className="flex flex-col gap-6 text-left mx-4">
      {/* 헤더 : 내 프로필과 동일 레이아웃, 팔로우 버튼 노출 */}
      <div className="pt-2">
        <ProfileHeader
          ownerId={user.id}
          ownerUsername={user.username}
          createdAt={user.created_at}
          averageRating={averageRating}
          followerCount={user._count?.followers ?? 0}
          followingCount={user._count?.following ?? 0}
          viewerId={viewerId}
          initialIsFollowing={!!user.isFollowing}
          avatarUrl={user.avatar ?? null}
          showFollowButton
          onRequireLogin={() =>
            router.push(`/login?callbackUrl=${encodeURIComponent(next)}`)
          }
        />
      </div>

      {/* 채널 섹션 */}
      <section aria-labelledby="s-channel">
        <div className="section-h">
          <h2
            id="s-channel"
            className="text-[15px] font-semibold text-neutral-900 dark:text-neutral-50"
          >
            🗼 방송국
          </h2>
          <Link
            href={`/profile/${user.username}/channel`}
            className="btn-ghost text-[12px]"
          >
            전체 방송 보기
          </Link>
        </div>

        {(myStreams?.length ?? 0) === 0 ? (
          <p className="mt-1 text-[12.5px] text-neutral-500 dark:text-neutral-400">
            아직 방송한 내역이 없습니다.
          </p>
        ) : (
          <div className="mt-2 flex gap-3 overflow-x-auto pb-2 items-stretch">
            {(myStreams ?? []).map((s) => (
              <StreamCard
                key={s.id}
                id={s.id}
                title={s.title}
                thumbnail={s.thumbnail}
                isLive={s.status === "CONNECTED"}
                streamer={{
                  username: s.user.username,
                  avatar: s.user.avatar ?? undefined,
                }}
                startedAt={s.started_at ?? undefined}
                category={
                  s.category
                    ? {
                        id: s.category.id,
                        kor_name: s.category.kor_name,
                        icon: s.category.icon ?? undefined,
                      }
                    : undefined
                }
                tags={s.tags}
                followersOnlyLocked={s.followersOnlyLocked}
                requiresPassword={s.requiresPassword}
                visibility={s.visibility}
                // onRequestFollow는 헤더 FollowSection에서 담당하므로 생략
                layout="rail"
              />
            ))}
          </div>
        )}
      </section>
      {/* 받은 거래 후기 */}
      <section aria-labelledby="s-reviews">
        <div className="section-h">
          <h2
            id="s-reviews"
            className="text-[15px] font-semibold text-neutral-900 dark:text-neutral-50"
          >
            📝 받은 거래 후기
          </h2>
          <button
            onClick={() => setIsReviewModalOpen(true)}
            className="btn-ghost text-[12px]"
          >
            전체 후기 보기
          </button>
        </div>
      </section>

      {/* 뱃지 */}
      <section aria-labelledby="s-badges">
        <div className="section-h">
          <h2
            id="s-badges"
            className="text-[15px] font-semibold text-neutral-900 dark:text-neutral-50"
          >
            🎖️ 획득한 뱃지
          </h2>
        </div>
        <div className="mt-1">
          <UserBadges badges={userBadges} max={10} />
        </div>
      </section>

      {/* 판매 제품 탭 */}
      <section aria-labelledby="s-products" className="">
        <h2
          id="s-products"
          className="text-[15px] font-semibold text-neutral-900 dark:text-neutral-50 mb-2"
        >
          ⚓ 판매 목록
        </h2>

        <div className="panel p-4">
          {/* 탭 */}
          <div className="flex justify-center gap-3 mb-4">
            <button
              onClick={() => setActiveTab("selling")}
              className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                activeTab === "selling"
                  ? "bg-primary text-white dark:bg-primary-light"
                  : "btn-quiet"
              }`}
            >
              판매 중
            </button>
            <button
              onClick={() => setActiveTab("sold")}
              className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                activeTab === "sold"
                  ? "bg-primary text-white dark:bg-primary-light"
                  : "btn-quiet"
              }`}
            >
              판매 완료
            </button>
          </div>

          {/* 뷰 전환 */}
          <div className="flex justify-end gap-2 mb-3">
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-lg ${
                viewMode === "list"
                  ? "bg-primary/10 text-primary dark:bg-primary-light/10 dark:text-primary-light"
                  : "text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              }`}
              aria-label="리스트 뷰"
            >
              <ListBulletIcon className="size-5" />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-lg ${
                viewMode === "grid"
                  ? "bg-primary/10 text-primary dark:bg-primary-light/10 dark:text-primary-light"
                  : "text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              }`}
              aria-label="그리드 뷰"
            >
              <Squares2X2Icon className="size-5" />
            </button>
          </div>

          {currentProducts.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-neutral-500 dark:text-neutral-400">
                {activeTab === "selling"
                  ? "판매 중인 제품이 없습니다."
                  : "판매 완료한 제품이 없습니다."}
              </p>
            </div>
          ) : (
            <>
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-2 gap-4 sm:gap-6"
                    : "flex flex-col gap-4"
                }
              >
                {currentProducts.map((product, i) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    viewMode={viewMode}
                    isPriority={i < 3}
                  />
                ))}
              </div>

              {current.hasMore && (
                <button
                  ref={triggerRef}
                  type="button"
                  onClick={() => !current.isLoading && current.loadMore()}
                  disabled={current.isLoading}
                  aria-busy={current.isLoading || undefined}
                  aria-live="polite"
                  className="mt-4 text-sm font-medium bg-primary/10 dark:bg-primary-light/10 text-primary dark:text-primary-light w-fit mx-auto px-4 py-2 rounded-full hover:bg-primary/20 dark:hover:bg-primary-light/20 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {current.isLoading ? (
                    <>
                      <span className="animate-spin">🌊</span> 항해중...
                    </>
                  ) : (
                    <>
                      <span>⚓</span> 더 보기
                    </>
                  )}
                </button>
              )}
            </>
          )}
        </div>
      </section>

      {/* 모달들 */}
      <ProfileReviewsModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        reviews={initialReviews}
        userId={user.id}
      />
    </div>
  );
}
