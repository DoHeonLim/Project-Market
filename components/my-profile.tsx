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
2025.05.16  임도헌   Modified  내 방송국 기능 추가
2025.05.22  임도헌   Modified  팔로우 기능 추가
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
import UserBadges from "./user-badges";
import StreamCard from "./stream-card";
import FollowListModal from "./modals/follow-list-modal";

type User = {
  id: number;
  username: string;
  avatar: string | null;
  email: string | null;
  created_at: Date;
  emailVerified: boolean;
  _count?: {
    followers: number;
    following: number;
  };
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

type Stream = {
  id: number;
  title: string;
  thumbnail: string | null;
  stream_id: string;
  status: string;
  user: {
    username: string;
    avatar: string | null;
  };
  started_at: Date | null;
  category: {
    kor_name: string;
    icon: string | null;
  };
  tags: { name: string }[];
};
type ProfileProps = {
  user: User;
  initialReviews: Review[];
  averageRating: { average: number; total: number } | null;
  logOut: () => Promise<void>;
  badges: Badge[];
  userBadges: Badge[];
  myStreams: Stream[];
};

export default function MyProfile({
  user,
  initialReviews,
  averageRating,
  logOut,
  badges,
  userBadges,
  myStreams,
}: ProfileProps) {
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isBadgeModalOpen, setIsBadgeModalOpen] = useState(false);
  const [isEmailVerificationModalOpen, setIsEmailVerificationModalOpen] =
    useState(false);
  const [isFollowersModalOpen, setIsFollowersModalOpen] = useState(false);
  const [isFollowingModalOpen, setIsFollowingModalOpen] = useState(false);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-10 rounded-xl w-full pt-10 relative">
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
            <div className="flex justify-center items-center gap-4">
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
                  팔로워 {user._count?.followers ?? 0}
                </button>
                <button
                  onClick={() => setIsFollowingModalOpen(true)}
                  className="hover:text-primary dark:hover:text-primary-light"
                >
                  팔로잉 {user._count?.following ?? 0}
                </button>
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
      {/* 내 방송국 섹션 */}
      <div className="w-full max-w-md mt-2 gap-2">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-bold dark:text-white">내 방송국</h2>
          <Link
            href={`/profile/${user.username}/streams`}
            className="btn-primary text-xs"
          >
            전체 방송 보기
          </Link>
        </div>
        {myStreams.length === 0 ? (
          <div className="text-gray-500 dark:text-gray-400 mb-2">
            아직 방송한 내역이 없습니다.
          </div>
        ) : (
          <div className="flex gap-4 mb-2">
            {myStreams.map((stream) => (
              <StreamCard
                key={stream.id}
                id={stream.id}
                title={stream.title}
                thumbnail={stream.thumbnail}
                isLive={stream.status === "CONNECTED"}
                streamer={{
                  username: stream.user.username,
                  avatar: stream.user.avatar,
                }}
                startedAt={
                  stream.started_at ? stream.started_at.toString() : undefined
                }
                category={
                  stream.category
                    ? {
                        kor_name: stream.category.kor_name,
                        icon: stream.category.icon ?? undefined,
                      }
                    : undefined
                }
                tags={stream.tags}
                shortDescription={true}
              />
            ))}
          </div>
        )}
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
        <UserBadges badges={userBadges} max={5} />
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
