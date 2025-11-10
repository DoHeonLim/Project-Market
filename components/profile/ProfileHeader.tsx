/**
 * File Name : components/profile/ProfileHeader
 * Description : 내/다른 유저 공용 프로필 헤더 — MyProfile 스타일로 통일
 * Author : 임도헌
 *
 * History
 * Date        Author   Status     Description
 * 2025.11.10  임도헌   Created    MyProfile 헤더 UI를 공용 컴포넌트로 분리
 */

"use client";

import UserAvatar from "@/components/common/UserAvatar";
import TimeAgo from "@/components/common/TimeAgo";
import UserRating from "@/components/profile/UserRating";
import FollowSection from "@/components/follow/FollowSection";
import type { ProfileAverageRating } from "@/types/profile";

type Props = {
  ownerId: number;
  ownerUsername: string;
  createdAt: string | Date;

  /** 평점 요약(없으면 0/0으로 표기) */
  averageRating: ProfileAverageRating | null;

  /** 서버 카운트 */
  followerCount: number;
  followingCount: number;

  /** 뷰어/팔로우 초기값 */
  viewerId?: number;
  initialIsFollowing?: boolean;

  /** 아바타 URL */
  avatarUrl?: string | null;

  /** 로그인 요구시 동작(없으면 FollowSection 기본동작 사용) */
  onRequireLogin?: () => void;

  /** 래퍼 커스텀 클래스(필요시) */
  className?: string;

  /** 내 프로필이 아니라면 true로 넘겨 버튼 노출 */
  showFollowButton?: boolean; // 기본값: true (FollowSection 내부에서 viewerId===ownerId면 자동 숨김)
};

export default function ProfileHeader({
  ownerId,
  ownerUsername,
  createdAt,
  averageRating,
  followerCount,
  followingCount,
  viewerId,
  initialIsFollowing,
  avatarUrl,
  onRequireLogin,
  className,
  showFollowButton = true,
}: Props) {
  return (
    <div
      className={[
        // ↓↓↓ MyProfile 헤더의 레이아웃/간격을 그대로 유지
        "md:flex-row flex flex-col items-center justify-center w-full gap-6",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <UserAvatar
        avatar={avatarUrl ?? undefined}
        username={ownerUsername}
        size="lg"
        showUsername={false}
        // MyProfile에서 disabled였음
        disabled
      />

      <div className="flex flex-col items-center md:items-start justify-center gap-2">
        <span className="dark:text-white text-lg">{ownerUsername}</span>
        <span className="text-sm text-gray-400">
          가입일: <TimeAgo date={createdAt} />
        </span>

        <UserRating
          average={averageRating?.averageRating ?? 0}
          totalReviews={averageRating?.reviewCount ?? 0}
          size="md"
        />
        <div className="flex justify-center items-center gap-4">
          <FollowSection
            ownerId={ownerId}
            ownerUsername={ownerUsername}
            initial={{
              isFollowing: !!initialIsFollowing,
              followerCount,
              followingCount,
            }}
            viewer={{ id: viewerId }}
            // 내 프로필이면 내부 규칙으로 버튼 자동 숨김
            showButton={showFollowButton}
            size="regular"
            align="start"
            onRequireLogin={onRequireLogin}
          />
        </div>
      </div>
    </div>
  );
}
