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
 * 2025.10.05  임도헌   Modified   averageRating 타입 최신 스키마로 정합
 * 2025.10.05  임도헌   Modified   FollowListModal prop 이름 변경(followingIds → viewerFollowingIds)
 * 2025.10.05  임도헌   Modified   myStreams 안전 가드 추가(length/map)
 * 2025.10.06  임도헌   Modified   BroadcastSummary 타입 단언 수정
 * 2025.10.12  임도헌   Modified   팔로워/팔로잉 로딩/커서/중복 제거 공용 훅 적용
 * 2025.10.14  임도헌   Modified   FollowSection 도입
 * 2025.10.29  임도헌   Modified   날짜 포맷 유틸/모달 지연 로드/a11y 보강
 * 2025.11.12  임도헌   Modified   액션 툴바 제거 → 섹션 헤더 우측 링크형 액션으로 통일,
 *                                SettingsMenu 커스텀 이벤트 리스너 도입
 * 2025.11.23  임도헌   Modified   내 방송국 섹션 StreamCard(layout="rail") 적용,
 *                                가로 스크롤 카드 폭/간격 반응형 정리
 * 2025.11.26  임도헌   Modified  StreamCard에 vodIdForRecording Props 추가
 */

"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useState } from "react";

import ProfileHeader from "./ProfileHeader";
import UserBadges from "./UserBadges";
import StreamCard from "../stream/StreamCard";
import { PushNotificationToggle } from "../common/PushNotificationToggle";

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

  // SettingsMenu(⚙️)에서 발행하는 커스텀 이벤트를 수신해 모달을 연다
  useEffect(() => {
    const onOpenPassword = () => setIsPasswordModalOpen(true);
    const onOpenEmail = () => setIsEmailVerificationModalOpen(true);

    window.addEventListener(
      "open-password-modal",
      onOpenPassword as unknown as EventListener
    );
    window.addEventListener(
      "open-email-verification-modal",
      onOpenEmail as unknown as EventListener
    );
    return () => {
      window.removeEventListener(
        "open-password-modal",
        onOpenPassword as unknown as EventListener
      );
      window.removeEventListener(
        "open-email-verification-modal",
        onOpenEmail as unknown as EventListener
      );
    };
  }, []);

  return (
    // 중앙정렬은 상위 레이아웃 책임 → 내부는 좌정렬/풀폭
    <div className="flex flex-col gap-6 text-left mx-4">
      {/* 헤더 */}
      <div className="pt-2">
        <ProfileHeader
          ownerId={user.id}
          ownerUsername={user.username}
          createdAt={user.created_at}
          averageRating={averageRating}
          followerCount={user._count?.followers ?? 0}
          followingCount={user._count?.following ?? 0}
          viewerId={viewerId}
          avatarUrl={user.avatar ?? null}
          showFollowButton={false} // 내 프로필
        />
      </div>

      {/* 알림 설정 */}
      <section aria-labelledby="s-notify">
        <h2
          id="s-notify"
          className="text-[15px] font-semibold text-neutral-900 dark:text-neutral-50 mb-2"
        >
          알림 설정
        </h2>
        <div className="panel">
          <div className="flex items-center justify-between gap-4 px-4 py-3">
            <div className="min-w-0">
              <h3 className="font-medium text-neutral-900 dark:text-neutral-100">
                푸시 알림
              </h3>
              <p className="text-[12.5px] text-neutral-600 dark:text-neutral-400">
                새로운 메시지나 거래 알림을 받아보세요
              </p>
            </div>
            <PushNotificationToggle />
          </div>
        </div>
      </section>

      {/* 내 방송국 */}
      <section aria-labelledby="s-channel">
        <div className="section-h">
          <h2
            id="s-channel"
            className="text-[15px] font-semibold text-neutral-900 dark:text-neutral-50"
          >
            🗼 내 방송국
          </h2>
          <Link
            href={`/profile/${user.username}/channel`}
            className="btn-ghost text-[12px]"
          >
            전체 방송 보기
          </Link>
        </div>

        {(myStreams?.length ?? 0) === 0 ? (
          <p className="mt-1 text-[12.5px] text-neutral-400">
            아직 방송한 내역이 없습니다.
          </p>
        ) : (
          <div className="mt-2 flex gap-3 overflow-x-auto scrollbar pb-2 items-stretch">
            {(myStreams ?? []).map((s) => (
              <StreamCard
                key={s.id}
                id={s.id}
                vodIdForRecording={s.latestVodId ?? undefined}
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
                // shortDescription
                layout="rail" // 가로 스크롤용 고정 폭 카드
              />
            ))}
          </div>
        )}
      </section>

      {/* 거래 정보 — 타일 */}
      <section aria-labelledby="s-trade">
        <h2
          id="s-trade"
          className="text-[15px] font-semibold text-neutral-900 dark:text-neutral-50 mb-2"
        >
          <span aria-hidden>⚓</span> 거래 정보
        </h2>
        <div className="grid grid-cols-2 gap-2">
          <Link
            href="/profile/my-sales"
            className="tile-strong p-4"
            aria-label="판매 제품 페이지로 이동"
          >
            <h3 className="text-[13px] font-semibold text-neutral-900 dark:text-neutral-100">
              판매 제품
            </h3>
            <p className="mt-1 text-[12px] text-neutral-600 dark:text-neutral-400">
              내가 판매중인 제품을 확인해보세요
            </p>
            <span className="mt-2 inline-flex text-[12px] text-[var(--link)]">
              바로 가기 →
            </span>
          </Link>

          <Link
            href="/profile/my-purchases"
            className="tile-strong p-4"
            aria-label="구매 제품 페이지로 이동"
          >
            <h3 className="text-[13px] font-semibold text-neutral-900 dark:text-neutral-100">
              구매 제품
            </h3>
            <p className="mt-1 text-[12px] text-neutral-600 dark:text-neutral-400">
              내가 구매한 제품을 확인해보세요
            </p>
            <span className="mt-2 inline-flex text-[12px] text-[var(--link)]">
              바로 가기 →
            </span>
          </Link>
        </div>
      </section>

      {/* 받은 거래 후기 */}
      <section aria-labelledby="s-reviews">
        <div className="section-h">
          <h2
            id="s-reviews"
            className="text-[15px] font-semibold text-neutral-900 dark:text-neutral-50"
          >
            <span aria-hidden>📝</span> 받은 거래 후기
          </h2>
          <button
            onClick={() => setIsReviewModalOpen(true)}
            className="btn-ghost text-[12px]"
            aria-label="받은 거래 후기 전체 보기"
          >
            전체 후기 보기
          </button>
        </div>
      </section>

      {/* 획득한 뱃지 */}
      <section aria-labelledby="s-badges">
        <div className="section-h">
          <h2
            id="s-badges"
            className="text-[15px] font-semibold text-neutral-900 dark:text-neutral-50"
          >
            🎖️ 획득한 뱃지
          </h2>
          <button
            onClick={() => setIsBadgeModalOpen(true)}
            className="btn-ghost text-[12px]"
          >
            전체 뱃지 보기
          </button>
        </div>
        <div className="mt-1">
          <UserBadges badges={userBadges} max={5} />
        </div>
      </section>

      {/* 로그아웃 */}
      <form action={logOut}>
        <button
          type="submit"
          className="w-full px-4 py-3 mt-2 text-[13px] rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium"
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
