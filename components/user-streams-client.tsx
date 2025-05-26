/**
 File Name : components/user-streams-client.tsx
 Description : 유저 방송국 client
 Author : 임도헌
 
 History
 Date        Author   Status    Description
 2025.05.16  임도헌   Created
 2025.05.16  임도헌   Modified  유저 방송국 client 컴포넌트
 2025.05.22  임도헌   Modified  팔로우 기능 추가
 */
"use client";
import StreamCard from "@/components/stream-card";
import UserAvatar from "@/components/user-avatar";
import Link from "next/link";
import FollowListModal from "@/components/modals/follow-list-modal";
import { useState } from "react";
import {
  UserInfo,
  UserStream,
} from "@/app/(tabs)/profile/[username]/streams/page";

interface UserInfoWithIsFollowing extends UserInfo {
  isFollowing: boolean;
}

export default function UserStreamsClient({
  userStreams,
  userInfo,
  me,
}: {
  userStreams: UserStream;
  userInfo: UserInfoWithIsFollowing;
  me: boolean;
}) {
  const [isFollowersModalOpen, setIsFollowersModalOpen] = useState(false);
  const [isFollowingModalOpen, setIsFollowingModalOpen] = useState(false);
  const [isFollowing, setIsFollowing] = useState(userInfo.isFollowing ?? false);
  const [followerCount, setFollowerCount] = useState(
    userInfo._count?.followers ?? 0
  );

  const live = userStreams.filter((s) => s.status === "CONNECTED");
  const replay = userStreams.filter((s) => s.status === "ENDED");

  // 팔로우 토글 함수
  const toggleFollow = async () => {
    try {
      const response = await fetch(`/api/users/${userInfo.id}/follow`, {
        method: isFollowing ? "DELETE" : "POST",
      });
      if (response.ok) {
        setIsFollowing(!isFollowing);
        setFollowerCount((prev) => (isFollowing ? prev - 1 : prev + 1));
      }
    } catch (error) {
      console.error("팔로우 토글 중 오류 발생:", error);
    }
  };

  return (
    <div className="container mx-auto max-w-lg px-2 py-8">
      {/* 상단 프로필 카드 */}
      <div className="flex flex-col items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-indigo-500/20 to-indigo-700/10 shadow mb-3">
        <UserAvatar
          avatar={userInfo.avatar}
          username={userInfo.username}
          size="lg"
          disabled={true}
          showUsername={false}
        />
        <div className="flex-1">
          <div className="text-xl font-bold dark:text-white">
            {userInfo.username}님의 방송국
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
          <button
            onClick={() => setIsFollowersModalOpen(true)}
            className="hover:text-primary dark:hover:text-primary-light"
          >
            팔로워 {followerCount}
          </button>
          <button
            onClick={() => setIsFollowingModalOpen(true)}
            className="hover:text-primary dark:hover:text-primary-light"
          >
            팔로잉 {userInfo._count?.following ?? 0}
          </button>
        </div>
        {/* 내가 아닐 경우에만 팔로우 버튼 */}
        {!me && (
          <button
            onClick={toggleFollow}
            className={`px-6 py-2 rounded-lg transition-colors ${
              isFollowing
                ? "bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-300 dark:hover:bg-neutral-600"
                : "bg-primary dark:bg-primary-light text-white hover:bg-primary/90 dark:hover:bg-primary-light/90"
            }`}
          >
            {isFollowing ? "팔로우 취소" : "팔로우"}
          </button>
        )}
      </div>
      <div className="flex justify-center mb-3">
        <Link
          href={`/profile/${userInfo.username}`}
          className="btn-primary w-full max-w-md text-center py-3"
        >
          프로필로 가기
        </Link>
      </div>

      {/* 실시간 방송 */}
      <div className="mb-8">
        <h3 className="font-semibold mb-2 text-lg dark:text-white">
          실시간 방송
        </h3>
        {live.length === 0 ? (
          <div className="flex flex-col items-center text-gray-400 mb-6 py-8">
            <span className="text-5xl mb-2">📡</span>
            <span>진행 중인 방송이 없습니다.</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 mb-6">
            {live.map((stream) => (
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
              />
            ))}
          </div>
        )}
      </div>

      {/* 다시보기 */}
      <div>
        <h3 className="font-semibold mb-2 text-lg dark:text-white">다시보기</h3>
        {replay.length !== 0 && (
          <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded">
            다시보기 {replay.length}
          </span>
        )}
        {replay.length === 0 ? (
          <div className="flex flex-col items-center text-gray-400 py-8">
            <span className="text-5xl mb-2">🎬</span>
            <span>다시보기 가능한 방송이 없습니다.</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {replay.map((stream) => (
              <StreamCard
                key={stream.id}
                id={stream.id}
                title={stream.title}
                thumbnail={stream.thumbnail}
                isLive={false}
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
                href={`/profile/${userInfo.username}/streams/${stream.id}`}
              />
            ))}
          </div>
        )}
      </div>
      <FollowListModal
        isOpen={isFollowersModalOpen}
        onClose={() => setIsFollowersModalOpen(false)}
        users={userInfo.followers?.map((f: any) => f.follower) ?? []}
        title="팔로워"
        followingIds={userInfo.following?.map((f: any) => f.following.id) ?? []}
      />
      <FollowListModal
        isOpen={isFollowingModalOpen}
        onClose={() => setIsFollowingModalOpen(false)}
        users={userInfo.following?.map((f: any) => f.following) ?? []}
        title="팔로잉"
        followingIds={userInfo.following?.map((f: any) => f.following.id) ?? []}
      />
    </div>
  );
}
