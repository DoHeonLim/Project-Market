/**
 * File Name : components/follow/FollowListModal
 * Description : 팔로워/팔로잉 목록 모달 (SSOT: row 상태는 user.*만 신뢰)
 * Author : 임도헌
 *
 * Key Points
 * - SSOT(단일 소스):
 *   - 버튼(토글) 상태는 FollowListUser.isFollowedByViewer만 신뢰한다. (viewer -> rowUser)
 *   - 섹션 분리(맞팔로잉/나머지)는 FollowListUser.isMutualWithOwner만 사용한다. owner 기준으로 통일
 *     - followers 모달: owner가 rowUser를 팔로우하면 true (owner -> rowUser)
 *     - following 모달: rowUser가 owner를 팔로우하면 true (rowUser -> owner)
 * - self(viewerId) 처리:
 *   - self row는 숨기지 않는다.
 *   - "나" 뱃지는 FollowListItem이 책임진다.
 * - 무한스크롤:
 *   - 더보기(more) 에러 상태에서 sentinel이 계속 보이면 무한 재호출 루프가 날 수 있어
 *     enabled를 끄는 방식으로 자동 트리거를 중단한다.
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
 * 2025.12.20  임도헌   Modified  FollowListItem 단일 소스화 반영(로컬 following 제거, 토글은 컨트롤러로)
 * 2025.12.20  임도헌   Modified  onToggle 핸들러 래핑 제거 + aria-live 상태 안내 추가
 * 2025.12.23  임도헌   Modified  error stage(first/more) UI 분기 + more일 때 무한스크롤 루프 방지
 * 2026.01.05  임도헌   Modified  레이어링 명시(클릭 이슈 방지) + owner 기준 맞팔 분리(isMutualWithOwner) 도입
 * 2026.01.06  임도헌   Modified  Key Points/용어 정리: isMutualWithOwner 기준 단일화 + self 숨김 규칙 제거
 */

"use client";

import { useEffect, useMemo, useRef } from "react";
import FollowListItem from "./FollowListItem";
import type { FollowListUser } from "@/types/profile";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";

type FollowListError =
  | { stage: "first"; message: string }
  | { stage: "more"; message: string }
  | null;

interface FollowListModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: FollowListUser[];
  title: string;
  kind: "followers" | "following";
  viewerId?: number;

  isLoading: boolean;
  hasMore: boolean;
  onLoadMore: () => Promise<void>;
  loadingMore: boolean;

  /** 컨트롤러 단일 책임 */
  onToggleItem?: (userId: number) => void | Promise<void>;
  isPendingById?: (id: number) => boolean;

  /** 페이징 에러(옵션): first/more 구분 */
  error?: FollowListError;
  onRetry?: () => void | Promise<void>;
}

export default function FollowListModal({
  isOpen,
  onClose,
  users,
  title,
  kind,
  viewerId,
  isLoading = false,
  hasMore = false,
  onLoadMore,
  loadingMore = false,
  onToggleItem,
  isPendingById,
  error,
  onRetry,
}: FollowListModalProps) {
  const isMoreError = error?.stage === "more";
  const isFirstError = error?.stage === "first";

  /**
   * 맞팔로잉/나머지 분리
   * - 기준은 오직 owner <-> rowUser: user.isMutualWithOwner
   * - viewerId(self)는 숨기지 않는다. (FollowListItem이 "나" 뱃지 처리)
   */
  const { mutual, rest } = useMemo(() => {
    const mutual = users.filter((u) => u.isMutualWithOwner);
    const rest = users.filter((u) => !u.isMutualWithOwner);
    return { mutual, rest };
  }, [users]);

  // a11y & UX: 포커스 / ESC / body scroll lock
  const dialogRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

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

  // Tab 포커스 트랩
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

  // more 에러 상태에서 sentinel이 계속 보이면 무한 재호출 루프 가능 → 자동 트리거 중단
  useInfiniteScroll({
    triggerRef: sentinelRef,
    hasMore,
    isLoading: loadingMore,
    onLoadMore: onLoadMore ?? (async () => {}),
    enabled: isOpen && hasMore && !isMoreError,
    rootRef: scrollAreaRef,
    rootMargin: "400px 0px 0px 0px",
    threshold: 0.1,
  });

  if (!isOpen) return null;

  const titleId = `followlistmodal-title-${kind}`;
  const mutualTitleId = `followlistmodal-mutual-title-${kind}`;
  const restTitleId = `followlistmodal-rest-title-${kind}`;

  const restLabel = kind === "followers" ? "추천" : "팔로잉";

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-hidden={!isOpen}>
      {/* backdrop: z-0 */}
      <div
        className="fixed inset-0 z-0 bg-black/25 dark:bg-black/40 transition-opacity"
        onClick={onClose}
      />

      {/* modal wrapper: z-10 */}
      <div className="relative z-10 flex min-h-full items-center justify-center p-4">
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          tabIndex={-1}
          className="relative w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-4 shadow-xl transition-all dark:bg-neutral-800"
        >
          <div className="mb-4">
            <h3
              id={titleId}
              className="text-lg font-medium text-gray-900 dark:text-white"
            >
              {title}
            </h3>

            <p className="sr-only" aria-live="polite">
              {isLoading
                ? "목록을 불러오는 중입니다."
                : loadingMore
                  ? "더 불러오는 중입니다."
                  : error
                    ? "목록을 불러오지 못했습니다."
                    : "목록이 준비되었습니다."}
            </p>
          </div>

          {/* 더보기 실패 배너(리스트는 유지) */}
          {isMoreError && (
            <div className="mb-3 rounded-lg bg-neutral-100 px-3 py-2 text-sm text-neutral-700 dark:bg-neutral-700/50 dark:text-neutral-200">
              <div className="flex items-center justify-between gap-3">
                <span>{error?.message}</span>
                {!!onRetry && (
                  <button
                    type="button"
                    onClick={onRetry}
                    className="shrink-0 rounded-md bg-primary px-3 py-1 text-xs font-semibold text-white hover:bg-primary/90"
                  >
                    다시 시도
                  </button>
                )}
              </div>
            </div>
          )}

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
              isFirstError ? (
                <div className="py-6 text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {error?.message}
                  </p>
                  {!!onRetry && (
                    <button
                      type="button"
                      onClick={onRetry}
                      className="mt-3 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90"
                    >
                      다시 시도
                    </button>
                  )}
                </div>
              ) : (
                <p className="py-4 text-center text-gray-500 dark:text-gray-400">
                  {kind === "followers"
                    ? "팔로워가 없습니다."
                    : "팔로우 중인 사용자가 없습니다."}
                </p>
              )
            ) : (
              <div className="space-y-4">
                {mutual.length > 0 && (
                  <section aria-labelledby={mutualTitleId}>
                    <div
                      id={mutualTitleId}
                      className="mb-2 text-[11px] font-semibold text-gray-700 dark:text-gray-200"
                    >
                      맞팔로잉
                    </div>
                    <div className="space-y-2">
                      {mutual.map((u) => (
                        <FollowListItem
                          key={u.id}
                          user={u}
                          viewerId={viewerId}
                          pending={isPendingById?.(u.id) ?? false}
                          onToggle={onToggleItem}
                          buttonVariant="primary"
                          buttonSize="sm"
                        />
                      ))}
                    </div>
                  </section>
                )}

                {rest.length > 0 && (
                  <section aria-labelledby={restTitleId}>
                    <div
                      id={restTitleId}
                      className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-200"
                    >
                      {restLabel}
                    </div>
                    <div className="space-y-2">
                      {rest.map((u) => (
                        <FollowListItem
                          key={u.id}
                          user={u}
                          viewerId={viewerId}
                          pending={isPendingById?.(u.id) ?? false}
                          onToggle={onToggleItem}
                          buttonVariant="primary"
                          buttonSize="sm"
                        />
                      ))}
                    </div>
                  </section>
                )}
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
