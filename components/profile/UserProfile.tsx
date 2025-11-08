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
 */
"use client";

import { useMemo, useRef, useState } from "react";
import { UserIcon } from "@heroicons/react/24/solid";
import { ListBulletIcon, Squares2X2Icon } from "@heroicons/react/24/outline";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

import UserRating from "./UserRating";
import ProfileReviewsModal from "./ProfileReviewsModal";
import UserBadges from "./UserBadges";
import FollowSection from "../follow/FollowSection";
import ProductCard from "../product/productCard";

import type { Paginated, ProductType, ViewMode } from "@/types/product";
import type {
  Badge,
  ProfileAverageRating,
  ProfileReview,
  UserProfile as UserProfileType,
} from "@/types/profile";

import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { usePageVisibility } from "@/hooks/usePageVisibility";
import { useProductPagination } from "@/hooks/useProductPagination";

type ProductStatus = "selling" | "sold";

interface UserProfileProps {
  user: UserProfileType & { isFollowing?: boolean };
  initialReviews: ProfileReview[];
  initialSellingProducts: Paginated<ProductType>; // { products: ProductType[]; nextCursor: number | null }
  initialSoldProducts: Paginated<ProductType>; // { products: ProductType[]; nextCursor: number | null }
  averageRating: ProfileAverageRating | null;
  userBadges: Badge[];
  viewerId?: number;
}

export default function UserProfile({
  user,
  initialReviews,
  initialSellingProducts,
  initialSoldProducts,
  averageRating,
  userBadges,
  viewerId,
}: UserProfileProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const next = useMemo(
    () => pathname + (searchParams.size ? `?${searchParams.toString()}` : ""),
    [pathname, searchParams]
  );

  // 뷰/탭
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

  // 현재 탭 파생값
  const current = activeTab === "selling" ? selling : sold;
  const currentProducts = current.products as ProductType[];

  // 무한스크롤 트리거 + 페이지 가시성
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
    <div className="flex flex-col items-center gap-6 mx-auto p-4">
      {/* 헤더 */}
      <div className="w-full bg-white dark:bg-neutral-800 rounded-xl p-8">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="relative size-40 md:size-52">
            {user.avatar ? (
              <Image
                src={`${user.avatar}/avatar`}
                alt={user.username}
                fill
                className="rounded-full object-cover"
              />
            ) : (
              <UserIcon className="size-full text-gray-300 dark:text-neutral-600" />
            )}
          </div>

          <div className="flex flex-col items-center md:items-start gap-4">
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
              {user.username}님의 프로필
            </h1>
            <span className="text-sm text-gray-400">
              가입일: {new Date(user.created_at).toLocaleDateString()}
            </span>

            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
              <div className="flex flex-col items-center gap-2">
                <FollowSection
                  ownerId={user.id}
                  ownerUsername={user.username}
                  initialIsFollowing={!!user.isFollowing}
                  initialFollowerCount={user._count?.followers ?? 0}
                  initialFollowingCount={user._count?.following ?? 0}
                  viewerId={viewerId}
                  showFollowButton={viewerId !== user.id}
                  variant="compact"
                  className="justify-center gap-3"
                  onRequireLogin={() =>
                    router.push(
                      `/login?callbackUrl=${encodeURIComponent(next)}`
                    )
                  }
                />

                <UserRating
                  average={averageRating?.averageRating ?? 0}
                  totalReviews={averageRating?.reviewCount ?? 0}
                  size="md"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <Link
        href={`/profile/${user.username}/channel`}
        className="btn-primary w-full max-w-md text-center py-3"
      >
        전체 방송 보기
      </Link>

      <button
        onClick={() => setIsReviewModalOpen(true)}
        className="btn-primary w-full max-w-md text-center py-3"
      >
        전체 후기 보기
      </button>

      {/* 판매 제품 탭 */}
      <div className="w-full bg-white dark:bg-neutral-800 rounded-xl p-6">
        <div className="flex justify-center gap-4 mb-6">
          <button
            onClick={() => setActiveTab("selling")}
            className={`px-6 py-2.5 rounded-lg transition-colors ${
              activeTab === "selling"
                ? "bg-primary dark:bg-primary-light text-white"
                : "bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-600"
            }`}
          >
            판매 중
          </button>
          <button
            onClick={() => setActiveTab("sold")}
            className={`px-6 py-2.5 rounded-lg transition-colors ${
              activeTab === "sold"
                ? "bg-primary dark:bg-primary-light text-white"
                : "bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-600"
            }`}
          >
            판매 완료
          </button>
        </div>

        {/* 뷰 모드 전환 */}
        <div className="flex justify-end gap-2 mb-4">
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 rounded-lg transition-colors ${
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
            className={`p-2 rounded-lg transition-colors ${
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
          <div className="py-12 text-center">
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
              {currentProducts.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  viewMode={viewMode}
                  isPriority={index < 3}
                />
              ))}
            </div>

            {current.hasMore && (
              <button
                ref={triggerRef}
                type="button"
                onClick={() => {
                  if (!current.isLoading) current.loadMore();
                }}
                disabled={current.isLoading}
                aria-busy={current.isLoading || undefined}
                aria-live="polite"
                className="mb-96 text-sm font-medium bg-primary/10 dark:bg-primary-light/10 text-primary dark:text-primary-light w-fit mx-auto px-4 py-2 rounded-full hover:bg-primary/20 dark:hover:bg-primary-light/20 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {current.isLoading ? (
                  <>
                    <span className="animate-spin">🌊</span> 항해중...
                  </>
                ) : (
                  <>
                    <span>⚓</span> 더 많은 보드게임 찾기
                  </>
                )}
              </button>
            )}
            {!current.hasMore && currentProducts.length > 0 && (
              <p className="py-6 text-center text-sm opacity-60">
                마지막 페이지입니다.
              </p>
            )}
          </>
        )}
      </div>

      <div className="w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <div className="text-lg font-semibold dark:text-white">
            획득한 뱃지
          </div>
        </div>
        <UserBadges badges={userBadges} max={20} />
      </div>

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
