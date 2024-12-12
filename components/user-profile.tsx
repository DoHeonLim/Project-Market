/**
File Name : components/my-salse-product-item
Description : 나의 판매 제품 상세 컴포넌트
Author : 임도헌

History
Date        Author   Status    Description
2024.12.07  임도헌   Created   
2024.12.07  임도헌   Modified  유저 프로필 페이지 추가
2024.12.07  임도헌   Modified  무한 스크롤 추가
2024.12.07  임도헌   Modified  평균 평점 및 갯수 로직 수정
2024.12.12  임도헌   Modified  photo속성에서 images로 변경
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
  id: number;
  title: string;
  price: number;
  images: {
    url: string;
  }[];
  created_at: Date;
  reservation_userId: number | null;
  purchase_userId: number | null;
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
    <div className="flex flex-col items-center gap-4 my-4 px-4">
      <span className="text-2xl font-semibold">{user.username}님의 프로필</span>

      <div className="flex gap-10 rounded-xl w-full py-10">
        <div className="w-full md:flex-row md:mr-10 flex flex-col justify-around items-center space-y-6">
          <div className="md:flex-row flex flex-col items-center justify-center w-full gap-6">
            {user.avatar !== null ? (
              <Image
                width={200}
                height={200}
                src={`${user.avatar}/avatar`}
                alt={user.username}
                className="rounded-full w-52 h-52 object-cover"
              />
            ) : (
              <UserIcon className="w-52 h-52 text-gray-300" />
            )}
            <div className="flex flex-col items-center md:items-start justify-center gap-2">
              <span className="text-lg">{user.username}</span>
              <span className="text-sm text-gray-400">
                가입일: {new Date(user.created_at).toLocaleDateString()}
              </span>
              <div className="flex justify-center items-center">
                <UserRating
                  rating={averageRating?.average}
                  totalReviews={averageRating?.total}
                  size="md"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 리뷰 모달 버튼 */}
      <div>
        <button
          onClick={() => setIsReviewModalOpen(true)}
          className="w-full px-4 py-3 bg-indigo-600 rounded-md hover:bg-indigo-400 transition-colors"
        >
          전체 후기 보기
        </button>
      </div>

      {/* 판매 제품 탭 */}
      <div className="w-full max-w-5xl mt-8">
        <div className="flex justify-center gap-4 mb-6">
          <button
            onClick={() => setActiveTab("selling")}
            className={`px-4 py-2 rounded-md transition-colors ${
              activeTab === "selling"
                ? "bg-indigo-600"
                : "bg-neutral-600 hover:bg-neutral-500"
            }`}
          >
            판매 중
          </button>
          <button
            onClick={() => setActiveTab("sold")}
            className={`px-4 py-2 rounded-md transition-colors ${
              activeTab === "sold"
                ? "bg-indigo-600"
                : "bg-neutral-600 hover:bg-neutral-500"
            }`}
          >
            판매 완료
          </button>
        </div>

        <div className="flex flex-col gap-4">
          {currentProducts.map((product) => (
            <ListProduct key={product.id} {...product} />
          ))}
        </div>

        {!isLastPage && (
          <div ref={trigger} className="h-4 my-4">
            {isLoading && <ProductsSkeleton />}
          </div>
        )}

        {isLastPage && currentProducts.length === 0 && (
          <div className="text-center text-gray-400 my-8">
            {activeTab === "selling"
              ? "판매 중인 제품이 없습니다."
              : "판매 완료된 제품이 없습니다."}
          </div>
        )}
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
