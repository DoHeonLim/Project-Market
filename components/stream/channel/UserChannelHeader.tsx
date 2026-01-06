/**
 * File Name : components/stream/channel/UserChannelHeader
 * Description : 유저 방송국 상단 헤더 (FollowSection 포함)
 * Author : 임도헌
 *
 * History
 * 2025.08.09  임도헌   Created
 * 2025.09.09  임도헌   Modified  팔로우 버튼 클릭/대기상태 로깅
 * 2025.10.14  임도헌   Modified  FollowSection 내장, 콜백/상태 관리 제거
 * 2025.11.10  임도헌   Modified  변경된 FollowSection에 맞게 수정
 */
"use client";

import Link from "next/link";
import UserAvatar from "@/components/common/UserAvatar";
import FollowSection from "@/components/follow/FollowSection";

interface Props {
  ownerId: number;
  username: string;
  avatar?: string | null;

  initialFollowerCount: number;
  initialFollowingCount: number;
  initialIsFollowing: boolean;

  isMe: boolean;
  viewerId?: number;

  onRequireLogin?: () => void;
  onFollowingChange?: (now: boolean) => void;
}

export default function UserChannelHeader({
  ownerId,
  username,
  avatar,
  initialFollowerCount,
  initialFollowingCount,
  initialIsFollowing,
  isMe,
  viewerId,
  onRequireLogin,
  onFollowingChange,
}: Props) {
  return (
    <div className="mx-auto max-w-3xl px-4 pt-6 pb-4">
      <div className="flex items-center gap-3">
        <UserAvatar username={username} avatar={avatar} size="md" />
        <div className="flex-1">
          <div className="flex justify-center gap-3 mt-1">
            <FollowSection
              ownerId={ownerId}
              ownerUsername={username}
              initial={{
                isFollowing: !!initialIsFollowing,
                followerCount: initialFollowerCount,
                followingCount: initialFollowingCount,
              }}
              viewer={{ id: viewerId }}
              showButton={!isMe}
              size="compact"
              align="center"
              onRequireLogin={onRequireLogin}
              onFollowingChange={onFollowingChange}
              followButtonId="channel-follow-button"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-center mb-3">
        <Link
          href={`/profile/${username}`}
          className="btn-primary w-full max-w-md text-center py-3"
        >
          프로필로 가기
        </Link>
      </div>
    </div>
  );
}
