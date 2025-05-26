/**
File Name : components/user-profile
Description : 다른 유저 프로필 컴포넌트
Author : 임도헌

History
Date        Author   Status    Description
2024.12.07  임도헌   Created   
2024.12.07  임도헌   Modified  다른 유저 프로필 페이지 추가
2024.12.07  임도헌   Modified  무한 스크롤 추가
2024.12.07  임도헌   Modified  평균 평점 및 갯수 로직 수정
2024.12.12  임도헌   Modified  photo속성에서 images로 변경
2024.12.22  임도헌   Modified  제품 모델 변경에 따른 제품 타입 변경
2024.12.29  임도헌   Modified  다른 유저 프로필 컴포넌트 스타일 수정
2025.04.18  임도헌   Modified  유저 뱃지 기능 추가
2025.05.06  임도헌   Modified  그리드/리스트 뷰 모드 추가
2025.05.22  임도헌   Modified  팔로우 기능 추가
*/
"use client";

import { UserIcon } from "@heroicons/react/24/solid";
import Image from "next/image";
import UserRating from "./user-rating";
import { useEffect, useRef, useState } from "react";
import { getMoreUserProducts } from "@/app/(tabs)/profile/[username]/actions";
import ListProduct from "./list-product";
import { ProductsSkeleton } from "@/app/(tabs)/profile/[username]/loading";
import ProfileReviewsModal from "./modals/profile-reviews-modal";
import { ListBulletIcon, Squares2X2Icon } from "@heroicons/react/24/outline";
import Link from "next/link";
import UserBadges from "./user-badges";
import FollowListModal from "./modals/follow-list-modal";

type Products = {
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
};

type AverageRating = {
  average: number;
  total: number;
};

type Review = {
  id: number;
  userId: number;
  productId: number;
  payload: string;
  rate: number;
  user: {
    username: string;
    avatar: string | null;
  };
};

interface UserProfileProps {
  user: {
    id: number;
    username: string;
    avatar: string | null;
    created_at: Date;
    _count?: {
      followers: number;
      following: number;
    };
    isFollowing?: boolean;
    followers?: {
      follower: {
        id: number;
        username: string;
        avatar: string | null;
      };
    }[];
    following?: {
      following: {
        id: number;
        username: string;
        avatar: string | null;
      };
    }[];
  };
  initialReviews: Review[];
  initialSellingProducts: Products[];
  initialSoldProducts: Products[];
  averageRating: AverageRating | null;
  userBadges: {
    id: number;
    name: string;
    icon: string;
    description: string;
  }[];
}

type ProductStatus = "selling" | "sold";

export default function UserProfile({
  user,
  initialReviews,
  initialSellingProducts,
  initialSoldProducts,
  averageRating,
  userBadges,
}: UserProfileProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [activeTab, setActiveTab] = useState<ProductStatus>("selling"); // 초기 탭 설정
  const [sellingProducts, setSellingProducts] = useState(
    // 초기 판매 제품 설정
    initialSellingProducts
  );
  const [soldProducts, setSoldProducts] = useState(initialSoldProducts); // 초기 판매 완료 제품 설정
  const [isLoading, setIsLoading] = useState(false); // 로딩 상태 설정
  const [sellingPage, setSellingPage] = useState(0); // 판매 제품 페이지 설정
  const [soldPage, setSoldPage] = useState(0); // 판매 완료 제품 페이지 설정
  const [isLastSellingPage, setIsLastSellingPage] = useState(false); // 판매 제품 마지막 페이지 설정
  const [isLastSoldPage, setIsLastSoldPage] = useState(false); // 판매 완료 제품 마지막 페이지 설정
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false); // 리뷰 모달 상태 설정
  const [isFollowing, setIsFollowing] = useState(user.isFollowing ?? false);
  const [followerCount, setFollowerCount] = useState(
    user._count?.followers ?? 0
  );
  const trigger = useRef<HTMLDivElement>(null); // 무한 스크롤 트리거 설정
  const [isFollowersModalOpen, setIsFollowersModalOpen] = useState(false);
  const [isFollowingModalOpen, setIsFollowingModalOpen] = useState(false);

  const currentProducts =
    activeTab === "selling" ? sellingProducts : soldProducts; // 현재 탭에 맞는 제품 설정
  const isLastPage =
    activeTab === "selling" ? isLastSellingPage : isLastSoldPage; // 현재 탭에 맞는 마지막 페이지 설정
  const currentPage = activeTab === "selling" ? sellingPage : soldPage; // 현재 탭에 맞는 페이지 설정

  // 팔로우 토글 함수
  const toggleFollow = async () => {
    try {
      const response = await fetch(`/api/users/${user.id}/follow`, {
        method: isFollowing ? "DELETE" : "POST",
      });

      if (response.ok) {
        setIsFollowing(!isFollowing);
        setFollowerCount((prev) => (isFollowing ? prev - 1 : prev + 1));
      }
    } catch (error) {
      console.error("팔로우 토글 중 오류 발생:", error);
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      async (
        entries: IntersectionObserverEntry[],
        observer: IntersectionObserver
      ) => {
        const element = entries[0];
        if (
          element.isIntersecting &&
          trigger.current &&
          //   !isLoading &&
          !isLastPage
        ) {
          observer.unobserve(trigger.current);
          setIsLoading(true);

          try {
            const newProducts = await getMoreUserProducts(
              user.id,
              activeTab,
              currentPage + 1
            );

            if (newProducts.length === 0) {
              if (activeTab === "selling") {
                setIsLastSellingPage(true);
              } else {
                setIsLastSoldPage(true);
              }
            } else {
              if (activeTab === "selling") {
                setSellingProducts((prev) => [...prev, ...newProducts]);
                setSellingPage((prev) => prev + 1);
              } else {
                setSoldProducts((prev) => [...prev, ...newProducts]);
                setSoldPage((prev) => prev + 1);
              }
            }
          } catch (error) {
            console.error("제품을 불러오는 중 오류 발생:", error);
          } finally {
            setIsLoading(false);
          }
        }
      },
      { threshold: 1.0 }
    );

    if (trigger.current && !isLastPage) {
      observer.observe(trigger.current);
    }

    return () => observer.disconnect();
  }, [user.id, activeTab, currentPage, isLoading, isLastPage]);

  return (
    <div className="flex flex-col items-center gap-6 mx-auto p-4">
      {/* 프로필 헤더 */}
      <div className="w-full bg-white dark:bg-neutral-800 rounded-xl p-8">
        <div className="flex flex-col md:flex-row items-center gap-8">
          {/* 프로필 이미지 */}
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

          {/* 유저 정보 */}
          <div className="flex flex-col items-center md:items-start gap-4">
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
              {user.username}님의 프로필
            </h1>
            <span className="text-sm text-gray-400">
              가입일: {new Date(user.created_at).toLocaleDateString()}
            </span>
            <div className="flex items-center gap-4">
              <UserRating
                rating={averageRating?.average}
                totalReviews={averageRating?.total}
                size="md"
              />
              <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                <button
                  onClick={() => setIsFollowersModalOpen(true)}
                  className="hover:text-primary dark:hover:text-primary-light"
                >
                  팔로워 {followerCount}
                </button>
                <button
                  onClick={() => setIsFollowingModalOpen(true)}
                  className="hover:text-primary dark:hover:text-primary-light"
                >
                  팔로잉 {user._count?.following ?? 0}
                </button>
              </div>
            </div>
            <button
              onClick={toggleFollow}
              className={`px-6 py-2 rounded-lg transition-colors ${
                isFollowing
                  ? "bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-300 dark:hover:bg-neutral-600"
                  : "bg-primary dark:bg-primary-light text-white hover:bg-primary/90 dark:hover:bg-primary-light/90"
              }`}
            >
              {isFollowing ? "팔로우 취소" : "팔로우"}
            </button>
          </div>
        </div>
      </div>

      <Link
        href={`/profile/${user.username}/streams`}
        className="btn-primary w-full max-w-md text-center py-3"
      >
        전체 방송 보기
      </Link>

      {/* 리뷰 버튼 */}
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

        {/* 제품 리스트 */}
        <div className="space-y-4">
          {/* 뷰 모드 전환 버튼 */}
          <div className="flex justify-end gap-2">
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
              {currentProducts.map((product) => (
                <ListProduct
                  key={product.id}
                  {...product}
                  viewMode={viewMode}
                />
              ))}
              {isLoading && <ProductsSkeleton />}
              {/* 무한 스크롤 트리거 */}
              {!isLastPage && <div ref={trigger} className="h-4 my-4" />}
            </>
          )}
        </div>
      </div>
      <div className="w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <div className="text-lg font-semibold dark:text-white">
            획득한 뱃지
          </div>
        </div>
        <UserBadges badges={userBadges} max={20} />
      </div>

      {/* 리뷰 모달 */}
      <ProfileReviewsModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        reviews={initialReviews}
        userId={user.id}
      />
      <FollowListModal
        isOpen={isFollowersModalOpen}
        onClose={() => setIsFollowersModalOpen(false)}
        users={user.followers?.map((f) => f.follower) ?? []}
        title="팔로워"
        followingIds={user.following?.map((f) => f.following.id) ?? []}
      />
      <FollowListModal
        isOpen={isFollowingModalOpen}
        onClose={() => setIsFollowingModalOpen(false)}
        users={user.following?.map((f) => f.following) ?? []}
        title="팔로잉"
        followingIds={user.following?.map((f) => f.following.id) ?? []}
      />
    </div>
  );
}
