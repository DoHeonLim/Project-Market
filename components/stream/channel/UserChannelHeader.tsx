/**
 * File Name : components/stream/channel/UserChannelHeader
 * Description : 유저 방송국 상단 헤더
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2025.08.09  임도헌   Created   헤더 분리
 * 2025.09.09  임도헌   Modified  [LOG] 팔로우 버튼 클릭/대기상태 로깅
 */
"use client";
import Link from "next/link";
import UserAvatar from "@/components/common/UserAvatar";

interface Props {
  username: string;
  avatar?: string | null;
  followerCount: number;
  followingCount: number;
  isMe: boolean;
  isFollowing: boolean;
  onToggleFollow: () => void;
  onOpenFollowers: () => void;
  onOpenFollowing: () => void;
  isPending?: boolean;
  followersOpenId?: string;
  followingOpenId?: string;
  isFollowersOpen?: boolean;
  isFollowingOpen?: boolean;
}

export default function UserChannelHeader({
  username,
  avatar,
  followerCount,
  followingCount,
  isMe,
  isFollowing,
  onToggleFollow,
  onOpenFollowers,
  onOpenFollowing,
  isPending = false,
}: Props) {
  return (
    <div className="mx-auto max-w-3xl px-4 pt-6 pb-4">
      <div className="flex items-center gap-3">
        <UserAvatar username={username} avatar={avatar} size="md" />
        <div className="flex-1">
          {/* 팔로워/팔로잉 버튼 */}
          <div className="flex justify-center text-base text-neutral-500 dark:text-neutral-400 gap-3 mt-1">
            <button
              type="button"
              onClick={onOpenFollowers}
              className="hover:text-primary dark:hover:text-primary-light"
            >
              팔로워 {followerCount}
            </button>
            <button
              type="button"
              onClick={onOpenFollowing}
              className="hover:text-primary dark:hover:text-primary-light"
            >
              팔로잉 {followingCount}
            </button>
          </div>
        </div>

        {!isMe && (
          <button
            onClick={onToggleFollow}
            disabled={isPending}
            className={`px-4 py-1.5 rounded-lg text-sm shadow transition-colors
              ${
                isFollowing
                  ? "bg-neutral-200 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-300 dark:hover:bg-neutral-600"
                  : "bg-primary text-white hover:bg-primary/90"
              }`}
          >
            {isPending ? "처리 중..." : isFollowing ? "팔로우 취소" : "팔로우"}
          </button>
        )}
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
