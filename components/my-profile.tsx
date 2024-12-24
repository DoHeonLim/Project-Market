/**
File Name : components/my-profile
Description : 프로필 클라이언트 코드
Author : 임도헌

History
Date        Author   Status    Description
2024.11.28  임도헌   Created
2024.11.28  임도헌   Modified  프로필 페이지에서 클라이언트 코드 분리
2024.11.30  임도헌   Modified  프로필 페이지 디자인 변경
2024.12.07  임도헌   Modified  프로필 페이지 디자인 다시 변경
2024.12.07  임도헌   Modified  프로필 이미지 컴포넌트 분리
2024.12.17  임도헌   Modified  프로필 페이지 디자인 변경
2024.12.20  임도헌   Modified  푸시 알림 토글 컴포넌트 추가
*/

"use client";

import { useState } from "react";
import Link from "next/link";
import PasswordChangeModal from "./password-change-modal";
import ProfileReviewsModal from "./modals/profile-reviews-modal";
import UserRating from "./user-rating";
import UserAvatar from "./user-avatar";
import { PushNotificationToggle } from "./push-notification-toggle";

type User = {
  id: number;
  username: string;
  avatar: string | null;
  email: string | null;
  created_at: Date;
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
  initialReviews: Review[];
  averageRating: { average: number; total: number } | null;
  logOut: () => Promise<void>;
};
export default function MyProfile({
  user,
  initialReviews,
  averageRating,
  logOut,
}: ProfileProps) {
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  return (
    <div className="flex flex-col items-center gap-4">
      <span className="text-2xl font-semibold dark:text-white mt-10">
        나의 프로필
      </span>

      <div className="flex gap-10 rounded-xl w-full pt-10">
        <div className="w-full md:flex-row md:mr-10 flex flex-col justify-around items-center space-y-6">
          <div className="md:flex-row flex flex-col items-center justify-center w-full gap-6">
            <UserAvatar
              avatar={user.avatar}
              username={user.username}
              size="lg"
              showUsername={false}
              disabled={true}
            />
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
      <div className="flex flex-col md:flex-row items-center justify-center gap-6 w-full max-w-md">
        <Link
          href="/profile/edit"
          className="btn-primary w-full md:w-1/2 text-center text-lg py-2.5 whitespace-nowrap"
        >
          프로필 수정
        </Link>
        {!user.email ? (
          ""
        ) : (
          <button
            onClick={() => setIsPasswordModalOpen(true)}
            className="btn-primary w-full md:w-1/2 text-center text-lg py-2.5 whitespace-nowrap"
          >
            비밀번호 수정
          </button>
        )}
      </div>

      <div className="w-full max-w-md">
        <div className="text-lg font-semibold mb-4 dark:text-white">
          알림 설정
        </div>
        <div className="flex items-center justify-between p-4 bg-white dark:bg-neutral-800 rounded-lg border border-gray-200 dark:border-neutral-700">
          <div>
            <h3 className="font-medium">푸시 알림</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              새로운 메시지나 거래 알림을 받아보세요
            </p>
          </div>
          <PushNotificationToggle />
        </div>
      </div>

      <div className="w-full max-w-md">
        <div className="text-lg font-semibold mb-4 dark:text-white">
          거래 정보
        </div>
        <div className="flex flex-col md:flex-row gap-6">
          <Link
            href="/profile/my-sales"
            className="btn-primary w-full text-center text-lg py-2.5"
          >
            판매 제품
          </Link>

          <Link
            href="/profile/my-purchases"
            className="btn-primary w-full text-center text-lg py-2.5"
          >
            구매 제품
          </Link>
        </div>
      </div>

      <div className="w-full max-w-md">
        <div className="text-lg font-semibold mb-4 dark:text-white">
          받은 거래 후기
        </div>
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
            className="btn-primary w-full text-lg py-2.5"
          >
            전체 후기 보기
          </button>
        </div>
      </div>

      <form action={logOut} className="w-full max-w-md mt-4">
        <button
          type="submit"
          className="w-full py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-md transition-colors dark:bg-red-600 dark:hover:bg-red-500"
        >
          로그아웃
        </button>
      </form>

      <ProfileReviewsModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        reviews={initialReviews}
        userId={user.id}
      />
      <PasswordChangeModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />
    </div>
  );
}
