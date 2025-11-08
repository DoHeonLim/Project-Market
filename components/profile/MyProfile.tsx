/**
 * File Name : components/profile/MyProfile
 * Description : 내 프로필 클라이언트 코드
 * Author : 임도헌
 *
 * History
 * Date        Author   Status     Description
 * 2024.11.28  임도헌   Created
 * 2024.11.28  임도헌   Modified   프로필 페이지에서 클라이언트 코드 분리
 * 2024.11.30  임도헌   Modified   프로필 페이지 디자인 변경
 * 2024.12.07  임도헌   Modified   프로필 페이지 디자인 다시 변경
 * 2024.12.07  임도헌   Modified   프로필 이미지 컴포넌트 분리
 * 2024.12.17  임도헌   Modified   프로필 페이지 디자인 변경
 * 2024.12.20  임도헌   Modified   푸시 알림 토글 컴포넌트 추가
 * 2024.12.31  임도헌   Modified   이메일 인증 기능 추가
 * 2025.05.22  임도헌   Modified   내 방송국 기능 추가
 * 2025.10.05  임도헌   Modified   averageRating 타입 최신 스키마로 정합(averageRating/reviewCount)
 * 2025.10.05  임도헌   Modified   FollowListModal prop 이름 변경(followingIds → viewerFollowingIds)
 * 2025.10.05  임도헌   Modified   myStreams 안전 가드 추가(length/map)
 * 2025.10.06  임도헌   Modified   BroadcastSummary 타입 단언 수정
 * 2025.10.12  임도헌   Modified   팔로워/팔로잉 로딩/커서/중복 제거 공용 훅 적용, Set 시드/병합
 * 2025.10.14  임도헌   Modified   FollowSection 도입: 팔로우/모달/페이지네이션 로직 제거
 * 2025.10.29  임도헌   Modified   날짜 포맷 유틸/모달 지연 로드/a11y 개선으로 UX·성능 보강
 */

"use client";

import dynamic from "next/dynamic";

import { useState } from "react";
import Link from "next/link";

import { PushNotificationToggle } from "../common/PushNotificationToggle";
import UserRating from "./UserRating";
import UserAvatar from "../common/UserAvatar";
import UserBadges from "./UserBadges";
import StreamCard from "../stream/StreamCard";
import FollowSection from "../follow/FollowSection";

const ProfileReviewsModal = dynamic(() => import("./ProfileReviewsModal"), {
  ssr: false,
});
const ProfileBadgesModal = dynamic(() => import("./ProfileBadgesModal"), {
  ssr: false,
});
const PasswordChangeModal = dynamic(() => import("./PasswordChangeModal"), {
  ssr: false,
});
const EmailVerificationModal = dynamic(
  () => import("./EmailVerificationModal"),
  { ssr: false }
);

import type { BroadcastSummary } from "@/types/stream";
import type {
  Badge,
  ProfileAverageRating,
  ProfileReview,
  UserProfile,
} from "@/types/profile";
import TimeAgo from "../common/TimeAgo";

type Props = {
  user: UserProfile;
  initialReviews: ProfileReview[];
  averageRating: ProfileAverageRating | null;
  badges: Badge[];
  userBadges: Badge[];
  myStreams?: BroadcastSummary[];
  viewerId?: number;
  logOut: () => Promise<void>;
};

export default function MyProfile({
  user,
  initialReviews,
  averageRating,
  badges,
  userBadges,
  myStreams,
  viewerId,
  logOut,
}: Props) {
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isBadgeModalOpen, setIsBadgeModalOpen] = useState(false);
  const [isEmailVerificationModalOpen, setIsEmailVerificationModalOpen] =
    useState(false);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-10 rounded-xl w-full pt-10 relative">
        <div className="md:flex-row flex flex-col items-center justify-center w-full gap-6">
          <UserAvatar
            avatar={user.avatar}
            username={user.username}
            size="lg"
            showUsername={false}
            disabled
          />
          <div className="flex flex-col items-center md:items-start justify-center gap-2">
            <span className="dark:text-white text-lg">{user.username}</span>
            <span className="text-sm text-gray-400">
              가입일: <TimeAgo date={user.created_at} />
            </span>
            <div className="flex justify-center items-center gap-4">
              <UserRating
                average={averageRating?.averageRating ?? 0}
                totalReviews={averageRating?.reviewCount ?? 0}
                size="md"
              />
              <FollowSection
                ownerId={user.id}
                ownerUsername={user.username}
                initialIsFollowing={false} // 내 프로필이므로 의미 없음
                initialFollowerCount={user._count.followers}
                initialFollowingCount={user._count.following}
                viewerId={viewerId}
                showFollowButton={false} // 내 프로필은 버튼 숨김
                variant="regular"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 액션/설정 영역 */}
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
            href={`/profile/${user.username}/channel`}
            className="btn-primary text-xs"
          >
            전체 방송 보기
          </Link>
        </div>
        {(myStreams?.length ?? 0) === 0 ? (
          <div className="text-gray-500 dark:text-gray-400">
            아직 방송한 내역이 없습니다.
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-2">
            {(myStreams ?? []).map((stream) => (
              <StreamCard
                key={stream.id}
                id={stream.id}
                title={stream.title}
                thumbnail={stream.thumbnail}
                isLive={stream.status === "CONNECTED"}
                streamer={{
                  username: stream.user.username,
                  avatar: stream.user.avatar ?? undefined,
                }}
                startedAt={stream.started_at ?? undefined}
                category={
                  stream.category
                    ? {
                        id: stream.category.id,
                        kor_name: stream.category.kor_name,
                        icon: stream.category.icon ?? undefined,
                      }
                    : undefined
                }
                tags={stream.tags}
                followersOnlyLocked={stream.followersOnlyLocked}
                requiresPassword={stream.requiresPassword}
                visibility={stream.visibility}
                shortDescription
              />
            ))}
          </div>
        )}
      </div>

      {/* 거래 정보/후기/뱃지/로그아웃은 기존 유지 */}
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
          aria-label="로그아웃"
          className="w-full py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-md transition-colors dark:bg-red-600 dark:hover:bg-red-500"
        >
          로그아웃
        </button>
      </form>

      {/* 모달들 */}
      <ProfileReviewsModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        reviews={initialReviews}
        userId={user.id}
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
      <PasswordChangeModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />
    </div>
  );
}
