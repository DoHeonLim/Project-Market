/**
 * File Name : components/follow/FollowListModal
 * Description : 팔로워/팔로잉 목록 모달 (뷰어 팔로잉 Set 반영 + 상향 콜백)
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2025.05.22  임도헌   Created
 * 2025.05.22  임도헌   Modified  Tailwind 스타일로 변경
 * 2025.05.22  임도헌   Modified  UserAvatar 컴포넌트 사용
 * 2025.09.08  임도헌   Modified  viewerId/viewerFollowingIds/onViewerFollowChange 지원
 * 2025.09.14  임도헌   Modified  a11y/UX 보강(Esc 닫기, 포커스 관리, 스크롤 잠금, 스크롤 영역 일관화)
 * 2025.09.19  임도헌   Modified  유저 팔로우, 팔로잉 무한스크롤 기능 추가
 */
"use client";

import { useEffect, useMemo, useRef } from "react";
import { UserInfo } from "@/types/stream";
import FollowListItem from "./FollowListItem";
import useInfiniteScroll from "@/hooks/useInfiniteScroll";

interface FollowListModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: UserInfo[];
  title: string; // "팔로워" | "팔로잉"
  viewerId?: number; // 현재 로그인 사용자 id
  viewerFollowingIds?: number[]; // 현재 사용자가 팔로우 중인 사용자 id 목록
  onViewerFollowChange?: (targetUserId: number, nowFollowing: boolean) => void; // 상향 콜백
  isLoading?: boolean;

  hasMore?: boolean;
  onLoadMore?: () => void | Promise<void>;
  loadingMore?: boolean;
}

export default function FollowListModal({
  isOpen,
  onClose,
  users,
  title,
  viewerId,
  viewerFollowingIds = [],
  onViewerFollowChange,
  isLoading = false,
  hasMore = false,
  onLoadMore,
  loadingMore = false,
}: FollowListModalProps) {
  const isFollowerModal = title === "팔로워";

  // 버튼 상태 계산을 위한 Set (파생값)
  const followingSet = useMemo(
    () => new Set<number>(viewerFollowingIds),
    [viewerFollowingIds]
  );

  // 팔로워 모달일 때만 맞팔/추천으로 나누고, 팔로잉 모달은 전체 리스트
  const { mutualFollowers, recommendedFollowers } = useMemo(() => {
    if (!isFollowerModal)
      return { mutualFollowers: [], recommendedFollowers: [] };
    const mutual = users.filter((u) => followingSet.has(u.id));
    const recommend = users.filter((u) => !followingSet.has(u.id));
    return { mutualFollowers: mutual, recommendedFollowers: recommend };
  }, [isFollowerModal, users, followingSet]);

  // a11y & UX: 포커스 / ESC / body scroll lock
  const dialogRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  // 스크롤 컨테이너 & 센티넬
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    // 포커스 저장 & 진입
    previouslyFocused.current = document.activeElement as HTMLElement | null;
    dialogRef.current?.focus();

    // ESC 닫기
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);

    // body 스크롤 잠금
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = original;
      // 포커스 복귀
      previouslyFocused.current?.focus?.();
    };
  }, [isOpen, onClose]);

  // 공통 훅으로 무한스크롤 연결
  useInfiniteScroll({
    triggerRef: sentinelRef,
    hasMore,
    isLoading: loadingMore, // 최초 로딩과 구분
    onLoadMore: onLoadMore ?? (() => {}),
    enabled: isOpen,
    root: scrollAreaRef.current, // 모달 내부 스크롤 영역
    rootMargin: "400px 0px 0px 0px", // 적당한 프리페치 여유
    threshold: 0.1,
  });

  if (!isOpen) return null;

  const titleId = "followlistmodal-title";

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-hidden={!isOpen}>
      {/* 배경 오버레이 */}
      <div
        className="fixed inset-0 bg-black/25 dark:bg-black/40 transition-opacity"
        onClick={onClose}
      />

      {/* 모달 컨테이너 */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          tabIndex={-1}
          className="relative w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all dark:bg-neutral-800"
        >
          {/* 헤더 */}
          <div className="mb-4">
            <h3
              id={titleId}
              className="text-lg font-medium text-gray-900 dark:text-white"
            >
              {title}
            </h3>
          </div>

          {/* 스크롤 영역 */}
          <div
            ref={scrollAreaRef}
            className="mt-2 max-h-[60vh] overflow-y-auto"
          >
            {isLoading ? (
              <p
                className="py-4 text-center text-gray-500 dark:text-gray-400"
                role="status"
              >
                불러오는 중...
              </p>
            ) : users.length === 0 ? (
              <p className="py-4 text-center text-gray-500 dark:text-gray-400">
                {title === "팔로워"
                  ? "팔로워가 없습니다."
                  : "팔로우 중인 사용자가 없습니다."}
              </p>
            ) : isFollowerModal ? (
              <div className="space-y-4">
                {mutualFollowers.length > 0 && (
                  <section>
                    <div className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-200">
                      맞팔로잉
                    </div>
                    <div className="space-y-2">
                      {mutualFollowers.map((user) => (
                        <FollowListItem
                          key={user.id}
                          user={user}
                          viewerId={viewerId}
                          isFollowing={true}
                          onChange={(now) =>
                            onViewerFollowChange?.(user.id, now)
                          }
                          buttonVariant="outline"
                          buttonSize="sm"
                        />
                      ))}
                    </div>
                  </section>
                )}

                {recommendedFollowers.length > 0 && (
                  <section>
                    <div className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-200">
                      추천
                    </div>
                    <div className="space-y-2">
                      {recommendedFollowers.map((user) => (
                        <FollowListItem
                          key={user.id}
                          user={user}
                          viewerId={viewerId}
                          isFollowing={false}
                          onChange={(now) =>
                            onViewerFollowChange?.(user.id, now)
                          }
                          buttonVariant="primary"
                          buttonSize="sm"
                        />
                      ))}
                    </div>
                  </section>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {users.map((user) => (
                  <FollowListItem
                    key={user.id}
                    user={user}
                    viewerId={viewerId}
                    isFollowing={followingSet.has(user.id)}
                    onChange={(now) => onViewerFollowChange?.(user.id, now)}
                    buttonVariant="outline"
                    buttonSize="sm"
                  />
                ))}
              </div>
            )}

            {/* 무한스크롤 센티넬 */}
            <div ref={sentinelRef} aria-hidden="true" className="h-8" />
            {loadingMore && (
              <p
                className="py-2 text-center text-gray-500 dark:text-gray-400"
                role="status"
                aria-busy="true"
              >
                더 불러오는 중...
              </p>
            )}
          </div>

          <div className="mt-6">
            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-lg bg-primary py-2.5 px-4 font-medium text-white transition-colors hover:bg-primary-dark dark:bg-primary-light dark:hover:bg-primary"
            >
              닫기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
