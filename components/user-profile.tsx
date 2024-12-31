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

type Products = {
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
  };
  initialReviews: Review[];
  initialSellingProducts: Products[];
  initialSoldProducts: Products[];
  averageRating: AverageRating | null;
}

type ProductStatus = "selling" | "sold";

export default function UserProfile({
  user,
  initialReviews,
  initialSellingProducts,
  initialSoldProducts,
  averageRating,
}: UserProfileProps) {
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
  const trigger = useRef<HTMLDivElement>(null); // 무한 스크롤 트리거 설정

  const currentProducts =
    activeTab === "selling" ? sellingProducts : soldProducts; // 현재 탭에 맞는 제품 설정
  const isLastPage =
    activeTab === "selling" ? isLastSellingPage : isLastSoldPage; // 현재 탭에 맞는 마지막 페이지 설정
  const currentPage = activeTab === "selling" ? sellingPage : soldPage; // 현재 탭에 맞는 페이지 설정

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
            <span className="text-sm text-neutral-500 dark:text-neutral-400">
              가입일: {new Date(user.created_at).toLocaleDateString()}
            </span>
            <div className="flex items-center gap-2">
              <UserRating
                rating={averageRating?.average}
                totalReviews={averageRating?.total}
                size="md"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 리뷰 버튼 */}
      <button
        onClick={() => setIsReviewModalOpen(true)}
        className="w-full max-w-md px-6 py-3 bg-primary hover:bg-primary-dark 
          dark:bg-primary-light dark:hover:bg-primary
          text-white rounded-xl transition-colors"
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
                <ListProduct key={product.id} {...product} />
              ))}
              {isLoading && <ProductsSkeleton />}
              {/* 무한 스크롤 트리거 */}
              {!isLastPage && <div ref={trigger} className="h-4 my-4" />}
            </>
          )}
        </div>
      </div>

      {/* 리뷰 모달 */}
      <ProfileReviewsModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        reviews={initialReviews}
        userId={user.id}
      />
    </div>
  );
}
