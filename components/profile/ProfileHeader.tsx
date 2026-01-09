/**
 * File Name : components/profile/ProfileHeader
 * Description : 내/다른 유저 공용 프로필 헤더 — MyProfile 스타일로 통일
 * Author : 임도헌
 *
 * History
 * Date        Author   Status     Description
 * 2025.11.10  임도헌   Created    MyProfile 헤더 UI를 공용 컴포넌트로 분리
 * 2025.11.18  임도헌   Modified   xl 미만에서 아바타/평점 사이즈 축소
 * 2025.12.12  임도헌   Modified   matchMedia change 이벤트 Safari 폴백(addListener) 추가
 * 2025.12.14  임도헌   Modified   ProfileHeader에 onFollowingChange prop 추가 → FollowSection으로 전달
 * 2025.12.20  임도헌   Modified   rail CTA 지원: followButtonId prop 추가 → FollowSection 버튼 id 주입
 */

"use client";

import { useEffect, useState } from "react";

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
  showFollowButton?: boolean;
  onFollowingChange?: (now: boolean) => void;

  // 팔로우 버튼 DOM id(rail에서 클릭 유도용)
  followButtonId?: string;
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
  showFollowButton = true,
  onFollowingChange,
  followButtonId,
}: Props) {
  const [isXL, setIsXL] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1280px)");
    const apply = () => setIsXL(mq.matches);
    apply();

    // Safari 폴백
    const anyMq = mq as unknown as {
      addEventListener?: (type: "change", cb: () => void) => void;
      removeEventListener?: (type: "change", cb: () => void) => void;
      addListener?: (cb: () => void) => void;
      removeListener?: (cb: () => void) => void;
    };

    if (anyMq.addEventListener) {
      anyMq.addEventListener("change", apply);
      return () => anyMq.removeEventListener?.("change", apply);
    }

    anyMq.addListener?.(apply);
    return () => anyMq.removeListener?.(apply);
  }, []);

  const avatarSize: "sm" | "md" | "lg" = isXL ? "lg" : "md";
  const ratingSize: "sm" | "md" | "lg" = isXL ? "md" : "sm";

  return (
    <header className="grid grid-cols-[auto,1fr] items-center gap-4 text-left">
      <UserAvatar
        avatar={avatarUrl ?? undefined}
        username={ownerUsername}
        size={avatarSize}
        showUsername={false}
        disabled
        className="ring-1 ring-white/70 dark:ring-neutral-900/70 shadow-sm"
      />

      <div className="min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h1 className="text-[17px] font-semibold leading-tight text-neutral-900 dark:text-neutral-50 truncate">
              {ownerUsername}
            </h1>
            <p className="mt-1.5 mr-1 text-xs leading-none text-neutral-500 dark:text-neutral-400">
              가입일 <TimeAgo date={createdAt} />
            </p>

            <div className="mt-2">
              <UserRating
                average={averageRating?.averageRating ?? 0}
                totalReviews={averageRating?.reviewCount ?? 0}
                size={ratingSize}
              />
            </div>
          </div>
        </div>

        <div className="mt-2.5">
          <FollowSection
            ownerId={ownerId}
            ownerUsername={ownerUsername}
            initial={{
              isFollowing: !!initialIsFollowing,
              followerCount,
              followingCount,
            }}
            viewer={{ id: viewerId }}
            showButton={showFollowButton}
            size="compact"
            align="start"
            onRequireLogin={onRequireLogin}
            onFollowingChange={onFollowingChange}
            followButtonId={followButtonId}
          />
        </div>
      </div>
    </header>
  );
}
