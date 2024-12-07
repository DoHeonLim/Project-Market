/**
File Name : components/my-profile
Description : 프로필 클라이언트 코드
Author : 임도헌

History
Date        Author   Status    Description
2024.11.28  임도헌   Created
2024.11.28  임도헌   Modified  프로필 페이지에서 클라이언트 코드 분리
2024.11.30  임도헌   Modified  프로필 페이지 디자인 변경
*/

"use client";

import { useState } from "react";
import { UserIcon } from "@heroicons/react/24/solid";
import Image from "next/image";
import Link from "next/link";
import PasswordChangeModal from "./password-change-modal";
import ProfileReviewsModal from "./modals/profile-reviews-modal";
import UserRating from "./user-rating";

type User = {
  id: number;
  username: string;
  avatar: string | null;
  email: string | null;
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

type ProfileProps = {
  user: User;
  reviews: Review[];
  averageRating: { average: number; total: number } | null;
  logOut: () => Promise<void>;
};
export default function MyProfile({
  user,
  reviews,
  averageRating,
  logOut,
}: ProfileProps) {
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  return (
    <div className="flex flex-col items-center gap-4 my-4 px-4">
      <span className="text-2xl font-semibold">프로필</span>

      <div className="flex gap-10 rounded-xl border-[2px] border-neutral-500 w-full py-10">
        <div className="w-full md:flex-row md:mr-10 flex flex-col justify-around items-center space-y-6">
          <div className="flex flex-col items-center justify-center w-full">
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
            <span>{user.username}</span>
          </div>

          <div className="flex flex-col items-center justify-center gap-6 w-1/2">
            <Link
              href="/profile/edit"
              className="primary-btn text-lg py-2.5 px-10"
            >
              프로필 수정
            </Link>
            {!user.email ? (
              ""
            ) : (
              <button
                onClick={() => setIsPasswordModalOpen(true)}
                className="w-full py-2.5 bg-indigo-600 text-white text-lg rounded-md hover:bg-indigo-400 transition-colors"
              >
                비밀번호 수정
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 다른 프로필 섹션들 */}
      <div className="w-full max-w-md">
        <div className="text-lg font-semibold mb-4">거래 정보</div>
        <div className="flex flex-col gap-6">
          <Link
            href="/profile/my-sales"
            className="primary-btn text-lg py-2.5 px-10"
          >
            판매 제품
          </Link>

          <Link
            href="/profile/my-purchases"
            className="primary-btn text-lg py-2.5 px-10"
          >
            구매 제품
          </Link>
        </div>
      </div>

      <div className="w-full max-w-md">
        <div className="text-lg font-semibold mb-4">받은 거래 후기</div>
        <div className="flex flex-col gap-3">
          {averageRating && (
            <UserRating
              rating={averageRating.average}
              totalReviews={averageRating.total}
              size="lg"
            />
          )}
          <button
            onClick={() => setIsReviewModalOpen(true)}
            className="w-full py-3 bg-indigo-600 rounded-md hover:bg-indigo-400 transition-colors"
          >
            전체 후기 보기
          </button>
        </div>
      </div>

      <form action={logOut} className="w-full max-w-md mt-4">
        <button
          type="submit"
          className="w-full py-3 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
        >
          로그아웃
        </button>
      </form>

      <ProfileReviewsModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        reviews={reviews}
        userId={user.id}
      />
      <PasswordChangeModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />
    </div>
  );
}
