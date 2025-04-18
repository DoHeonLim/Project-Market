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
2024.12.31  임도헌   Modified  이메일 인증 기능 추가
*/

"use client";

import { useState } from "react";
import Link from "next/link";
import PasswordChangeModal from "./modals/password-change-modal";
import ProfileReviewsModal from "./modals/profile-reviews-modal";
import UserRating from "./user-rating";
import UserAvatar from "./user-avatar";
import { PushNotificationToggle } from "./push-notification-toggle";
import ProfileBadgesModal from "./modals/profile-badges-modal";
import EmailVerificationModal from "./modals/email-verification-modal";
import Image from "next/image";
import { getBadgeKoreanName } from "@/lib/utils";

type User = {
  id: number;
  username: string;
  avatar: string | null;
  email: string | null;
  created_at: Date;
  emailVerified: boolean;
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

type Badge = {
  id: number;
  name: string;
  icon: string;
  description: string;
};

type ProfileProps = {
  user: User;
  initialReviews: Review[];
  averageRating: { average: number; total: number } | null;
  logOut: () => Promise<void>;
  badges: Badge[];
  userBadges: Badge[];
};

export default function MyProfile({
  user,
  initialReviews,
  averageRating,
  logOut,
  badges,
  userBadges,
}: ProfileProps) {
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isBadgeModalOpen, setIsBadgeModalOpen] = useState(false);
  const [isEmailVerificationModalOpen, setIsEmailVerificationModalOpen] =
    useState(false);

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
        <button
          onClick={() => setIsPasswordModalOpen(true)}
          className="btn-primary w-full md:w-1/2 text-center text-lg py-2.5 whitespace-nowrap"
        >
          비밀 항해 코드 수정
        </button>
      </div>
      <div className="flex flex-col md:flex-row items-center justify-center gap-6 w-full max-w-md">
        {!user.emailVerified ? (
          <button
            onClick={() => setIsEmailVerificationModalOpen(true)}
            className="btn-primary w-full md:w-1/2 text-center text-lg py-2.5 whitespace-nowrap"
          >
            이메일 인증
          </button>
        ) : (
          <div className="w-full md:w-1/2 text-center text-lg py-2.5 whitespace-nowrap bg-gray-200 dark:bg-neutral-700 text-gray-500 dark:text-gray-400 rounded-lg">
            이메일 인증됨
          </div>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/profile/my-sales"
            className="card bg-primary hover:bg-primary-dark dark:bg-primary-light dark:hover:bg-primary p-6 transition-all group"
          >
            <h3 className="text-xl font-semibold mb-3 text-white">판매 제품</h3>
            <p className="text-white/90">내가 판매중인 제품을 확인해보세요</p>
          </Link>
          <Link
            href="/profile/my-purchases"
            className="card bg-primary hover:bg-primary-dark dark:bg-primary-light dark:hover:bg-primary p-6 transition-all group"
          >
            <h3 className="text-xl font-semibold mb-3 text-white">구매 제품</h3>
            <p className="text-white/90">내가 구매한 제품을 확인해보세요</p>
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

      <div className="w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <div className="text-lg font-semibold dark:text-white">
            획득한 뱃지
          </div>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-neutral-700">
          {userBadges.slice(0, 5).map((badge) => (
            <div
              key={badge.id}
              className="flex flex-col items-center p-3 min-w-[80px] rounded-lg bg-primary/5 dark:bg-primary-light/5 border border-primary/30 dark:border-primary-light/30"
            >
              <div className={`relative w-12 h-12 mb-2`}>
                <Image
                  src={`${badge.icon}/public`}
                  alt={getBadgeKoreanName(badge.name)}
                  fill
                  className="object-contain transition-opacity"
                  sizes="(max-width: 48px) 100vw, 48px"
                />
              </div>
              <span className="text-xs text-center">
                {getBadgeKoreanName(badge.name)}
              </span>
            </div>
          ))}
        </div>
        <button
          onClick={() => setIsBadgeModalOpen(true)}
          className="btn-primary w-full text-lg py-2.5"
        >
          전체 뱃지 보기
        </button>
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
      <ProfileBadgesModal
        isOpen={isBadgeModalOpen}
        closeModal={() => setIsBadgeModalOpen(false)}
        badges={badges}
        userBadges={userBadges}
      />
      <EmailVerificationModal
        isOpen={isEmailVerificationModalOpen}
        onClose={() => setIsEmailVerificationModalOpen(false)}
        email={user.email || ""}
      />
    </div>
  );
}
