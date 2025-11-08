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
 * 2025.10.12  임도헌   Modified  users 타입 정합(FollowListUser), useInfiniteScroll rootRef 적용,
 *                                isFollowing 계산(followingSet 우선, 없으면 user.isFollowedByViewer)
 * 2025.10.12  임도헌   Modified  viewerFollowingIds/Set/compute 제거, isFollowedByViewer만 사용
 * 2025.10.29  임도헌   Modified  Tab 포커스 트랩, 무한스크롤 hasMore 가드, 로우 버튼 a11y(aria-busy/pressed) 전달 보강
 */
"use client";

import { useEffect, useMemo, useRef } from "react";
import FollowListItem from "./FollowListItem";
import type { FollowListUser } from "@/types/profile";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";

interface FollowListModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: FollowListUser[]; // { id, username, avatar, isFollowedByViewer }
  title: string;
  kind: "followers" | "following";
  viewerId?: number;
  onViewerFollowChange: (user: FollowListUser, now: boolean) => void;

  // 페이지네이션
  isLoading: boolean;
  hasMore: boolean;
  onLoadMore: () => Promise<void>;
  loadingMore: boolean;

  // 행 단위 토글/펜딩(선택)
  onToggleItem?: (
    user: FollowListUser,
    was: boolean,
    h: { onOptimistic: () => void; onRollback: () => void }
  ) => Promise<void>;
  isPendingById?: (id: number) => boolean;
}

export default function FollowListModal({
  isOpen,
  onClose,
  users,
  title,
  kind,
  viewerId,
  onViewerFollowChange,
  isLoading = false,
  hasMore = false,
  onLoadMore,
  loadingMore = false,
  onToggleItem,
  isPendingById,
}: FollowListModalProps) {
  const isFollowerModal = kind === "followers";

  // viewerId를 고려해 '나'는 무조건 맞팔로잉으로 보내고, 추천에선 제외
  const { mutualFollowers, recommendedFollowers } = useMemo(() => {
    if (!isFollowerModal) {
      return {
        mutualFollowers: [] as FollowListUser[],
        recommendedFollowers: [] as FollowListUser[],
      };
    }

    const selfId = viewerId ?? -1;

    // 자기 자신이면 무조건 mutual 로 분류
    const mutual = users.filter(
      (u) => u.id === selfId || !!u.isFollowedByViewer
    );

    // 추천에서는 자기 자신을 제외
    const recommend = users.filter(
      (u) => u.id !== selfId && !u.isFollowedByViewer
    );

    return { mutualFollowers: mutual, recommendedFollowers: recommend };
  }, [isFollowerModal, users, viewerId]);

  // a11y & UX: 포커스 / ESC / body scroll lock
  const dialogRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  // 스크롤 컨테이너 & 센티넬
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    previouslyFocused.current = document.activeElement as HTMLElement | null;
    dialogRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);

    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = original;
      previouslyFocused.current?.focus?.();
    };
  }, [isOpen, onClose]);

  // Tab 포커스 트랩 (모달 내부 순환)
  useEffect(() => {
    if (!isOpen || !dialogRef.current) return;

    const dialog = dialogRef.current;
    const getFocusables = () =>
      dialog.querySelectorAll<HTMLElement>(
        'a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
      );

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const focusables = getFocusables();
      if (!focusables.length) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    dialog.addEventListener("keydown", onKeyDown);
    return () => dialog.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  // 무한스크롤: hasMore=false면 옵저버 비활성
  useInfiniteScroll({
    triggerRef: sentinelRef,
    hasMore,
    isLoading: loadingMore,
    onLoadMore: onLoadMore ?? (async () => {}),
    enabled: isOpen && hasMore,
    rootRef: scrollAreaRef,
    rootMargin: "400px 0px 0px 0px",
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
                aria-busy="true"
              >
                불러오는 중...
              </p>
            ) : users.length === 0 ? (
              <p className="py-4 text-center text-gray-500 dark:text-gray-400">
                {isFollowerModal
                  ? "팔로워가 없습니다."
                  : "팔로우 중인 사용자가 없습니다."}
              </p>
            ) : isFollowerModal ? (
              <div className="space-y-4">
                {mutualFollowers.length > 0 && (
                  <section aria-labelledby="mutual-section-title">
                    <div
                      id="mutual-section-title"
                      className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-200"
                    >
                      맞팔로잉
                    </div>
                    <div className="space-y-2">
                      {mutualFollowers.map((u) => (
                        <FollowListItem
                          key={u.id}
                          user={u}
                          viewerId={viewerId}
                          isFollowing={true}
                          onChange={(u, now) => onViewerFollowChange?.(u, now)}
                          onToggle={onToggleItem}
                          pending={isPendingById?.(u.id) ?? false}
                          buttonVariant="primary"
                          buttonSize="sm"
                          // 접근성 힌트 전달(선택: FollowListItem에 지원 추가)
                          a11yProps={{
                            "aria-busy": isPendingById?.(u.id) ?? false,
                            "aria-pressed": true,
                          }}
                        />
                      ))}
                    </div>
                  </section>
                )}

                {recommendedFollowers.length > 0 && (
                  <section aria-labelledby="recommend-section-title">
                    <div
                      id="recommend-section-title"
                      className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-200"
                    >
                      추천
                    </div>
                    <div className="space-y-2">
                      {recommendedFollowers.map((u) => (
                        <FollowListItem
                          key={u.id}
                          user={u}
                          viewerId={viewerId}
                          isFollowing={false}
                          onChange={(u, now) => onViewerFollowChange?.(u, now)}
                          onToggle={onToggleItem}
                          pending={isPendingById?.(u.id) ?? false}
                          buttonVariant="primary"
                          buttonSize="sm"
                          a11yProps={{
                            "aria-busy": isPendingById?.(u.id) ?? false,
                            "aria-pressed": false,
                          }}
                        />
                      ))}
                    </div>
                  </section>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {users.map((u) => (
                  <FollowListItem
                    key={u.id}
                    user={u}
                    viewerId={viewerId}
                    isFollowing={!!u.isFollowedByViewer}
                    onChange={(u, now) => onViewerFollowChange?.(u, now)}
                    onToggle={onToggleItem}
                    pending={isPendingById?.(u.id) ?? false}
                    buttonVariant="primary"
                    buttonSize="sm"
                    a11yProps={{
                      "aria-busy": isPendingById?.(u.id) ?? false,
                      "aria-pressed": !!u.isFollowedByViewer,
                    }}
                  />
                ))}
              </div>
            )}

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
