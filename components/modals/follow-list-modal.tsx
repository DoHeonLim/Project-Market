/**
File Name : components/modals/follow-list-modal
Description : 팔로워/팔로잉 목록 모달
Author : 임도헌

History
Date        Author   Status    Description
2025.05.22  임도헌   Created
2025.05.22  임도헌   Modified  Tailwind 스타일로 변경
2025.05.22  임도헌   Modified  UserAvatar 컴포넌트 사용
*/

"use client";

import FollowListItem from "../follow/FollowListItem";

interface User {
  id: number;
  username: string;
  avatar: string | null;
}

interface FollowListModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: User[];
  title: string; // "팔로워" | "팔로잉"
  currentUserId?: number; // 현재 로그인한 내 id
  followingIds?: number[]; // 내가 팔로우 중인 유저 id 리스트
}

export default function FollowListModal({
  isOpen,
  onClose,
  users,
  title,
  followingIds = [],
}: FollowListModalProps) {
  if (!isOpen) return null;

  const isFollowerModal = title === "팔로워";

  // 맞팔(서로 팔로우)과 추천(나를 팔로우하지만 내가 팔로우하지 않은) 분리
  const mutualFollowers = isFollowerModal
    ? users.filter((u) => followingIds.includes(u.id))
    : [];
  const recommendedFollowers = isFollowerModal
    ? users.filter((u) => !followingIds.includes(u.id))
    : [];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* 배경 오버레이 */}
      <div
        className="fixed inset-0 bg-black/25 dark:bg-black/40 transition-opacity"
        onClick={onClose}
      />

      {/* 모달 컨테이너 */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-neutral-800 p-6 shadow-xl transition-all">
          {/* 모달 헤더 */}
          <div className="mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {title}
            </h3>
          </div>

          {/* 모달 내용 */}
          <div className="mt-2">
            {users.length === 0 ? (
              <p className="text-center py-4 text-gray-500 dark:text-gray-400">
                {title === "팔로워"
                  ? "팔로워가 없습니다."
                  : "팔로우 중인 사용자가 없습니다."}
              </p>
            ) : isFollowerModal ? (
              <>
                {/* 맞팔 섹션 */}
                {mutualFollowers.length > 0 && (
                  <div className="mb-4">
                    <div className="font-semibold text-sm text-gray-700 dark:text-gray-200 mb-2">
                      맞팔로잉
                    </div>
                    <div className="space-y-2">
                      {mutualFollowers.map((user) => (
                        <FollowListItem
                          key={user.id}
                          user={user}
                          isFollowing={true}
                          showButton={true}
                          buttonVariant="outline"
                          buttonSize="sm"
                        />
                      ))}
                    </div>
                  </div>
                )}
                {/* 추천 섹션 */}
                {recommendedFollowers.length > 0 && (
                  <div>
                    <div className="font-semibold text-sm text-gray-700 dark:text-gray-200 mb-2">
                      추천
                    </div>
                    <div className="space-y-2">
                      {recommendedFollowers.map((user) => (
                        <FollowListItem
                          key={user.id}
                          user={user}
                          isFollowing={false}
                          showButton={true}
                          buttonVariant="primary"
                          buttonSize="sm"
                        />
                      ))}
                    </div>
                  </div>
                )}
                {mutualFollowers.length === 0 &&
                  recommendedFollowers.length === 0 && (
                    <p className="text-center py-4 text-gray-500 dark:text-gray-400">
                      팔로워가 없습니다.
                    </p>
                  )}
              </>
            ) : (
              <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                {users.map((user) => (
                  <FollowListItem
                    key={user.id}
                    user={user}
                    isFollowing={true}
                    showButton={true}
                    buttonVariant="outline"
                    buttonSize="sm"
                  />
                ))}
              </div>
            )}
          </div>

          {/* 모달 푸터 */}
          <div className="mt-6">
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 px-4 bg-primary hover:bg-primary-dark dark:bg-primary-light dark:hover:bg-primary text-white font-medium rounded-lg transition-colors"
            >
              닫기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
