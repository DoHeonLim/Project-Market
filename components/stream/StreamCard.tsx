/**
 * File Name : components/stream/StreamCard
 * Description : 스트리밍 카드 섹션 (라이브/녹화 공용)
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2025.05.16  임도헌   Created
 * 2025.05.16  임도헌   Modified  스트리밍 카드 섹션 추가
 * 2025.08.10  임도헌   Modified  썸네일 cover, 모달 접근성, 팔로우 오버레이 옵션
 * 2025.08.10  임도헌   Modified  requiresPassword/followersOnlyLocked 지원, 비번 비교 제거
 * 2025.08.14  임도헌   Modified  썸네일 URL 정규화(Cloudflare Stream/Images) 및 녹화 카드 재사용
 * 2025.08.26  임도헌   Modified  형식 배지 단일화(LIVE/팔로워/비밀), 메타 줄 깨짐 수정, 썸네일 cover
 * 2025.08.27  임도헌   Modified  배지 다중 표기(LIVE/다시보기/팔로워/비밀) 별도 노출, isPrivateType 지원
 * 2025.08.30  임도헌   Modified  PrivateAccessModal 공용 모달로 교체
 * 2025.09.03  임도헌   Modified  기본 href 분기(라이브/녹화) 및 모달 redirect 경로 일치
 * 2025.09.05  임도헌   Modified  (a11y) 잠금 시 키보드 네비 차단(Enter/Space), 오버레이 버튼 aria 보강
 * 2025.09.10  임도헌   Modified  a11y(aria-disabled/배지 sr-only), useMemo로 계산값 메모
 * 2025.09.23  임도헌   Modified  뷰포트에 들어오면 미니 프리뷰 iframe 렌더
 * 2025.11.23  임도헌   Modified  layout(grid/rail) prop 도입, 카드 flex(h-full) 레이아웃 정리,
 *                                내/채널/리스트 공용 카드 폭 제어
 * 2025.11.23  임도헌   Modified  카드 하단 레이아웃을 제목/유저/메타 3단 구조로 재배치
 * 2025.11.26  임도헌   Modified  라이브/녹화용 id를 분리하도록 수정
 */

"use client";

import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import UserAvatar from "../common/UserAvatar";
import { formatToTimeAgo } from "@/lib/utils";
import { PhotoIcon, LockClosedIcon } from "@heroicons/react/24/outline";
import PrivateAccessModal from "./PrivateAccessModal";
import {
  StreamCategory,
  StreamVisibility,
  STREAM_VISIBILITY,
} from "@/types/stream";

interface StreamCardProps {
  /** unlock 타깃(원본 streamId 권장) */
  id: number;
  /** 녹화본 페이지로 이동할 때 사용할 VodAsset id (없으면 id로 폴백) */
  vodIdForRecording?: number;
  title: string;
  thumbnail?: string | null;
  /** 라이브 여부 (false면 다시보기 배지 표시) */
  isLive: boolean;
  streamer: { username: string; avatar?: string | null };

  /** 서버에서 Date로 오기도 하므로 넓혀서 수용 */
  startedAt?: Date | string | null;

  category?: StreamCategory | null;
  tags?: { name: string }[];
  shortDescription?: boolean;

  /** 직접 지정하면 우선 사용, 없으면 isLive 기준으로 기본 경로 계산 */
  href?: string;

  // 서버 플래그
  /** PRIVATE 접근 필요 여부(언락 전). 언락 후 false가 될 수 있음 */
  requiresPassword?: boolean;
  /** FOLLOWERS 타입 여부(형식) — 전달 안 되면 visibility로 판정 */
  isFollowersOnly?: boolean;
  /** 비팔로워라 접근 잠금일 때 true (오버레이/CTA 트리거) */
  followersOnlyLocked?: boolean;

  /** visibility가 있으면 배지/잠금 보조 판별에 사용 가능 */
  visibility?: StreamVisibility;

  // 옵션: 언락 이후에도 '비밀' 배지를 계속 보여주고 싶다면 명시적으로 true 전달
  /** visibility === "PRIVATE" 타입 표시(언락 후에도 '비밀' 배지를 유지하고 싶을 때 사용) */
  isPrivateType?: boolean;

  // 옵션 액션
  onRequestFollow?: () => void; // 팔로우 CTA

  /** 레이아웃 모드: grid(기본), rail(가로 스크롤용 고정폭 카드) */
  layout?: "grid" | "rail";
}

function resolveThumbUrl(src?: string | null): string | null {
  if (!src) return null;
  if (src.startsWith("https://imagedelivery.net")) return `${src}/public`;
  return src;
}

export default function StreamCard(props: StreamCardProps) {
  const {
    id,
    vodIdForRecording,
    title,
    thumbnail,
    isLive,
    streamer,
    startedAt,
    category,
    tags,
    shortDescription = false,
    href,
    requiresPassword = false,
    isFollowersOnly,
    followersOnlyLocked = false,
    visibility,
    isPrivateType,
    onRequestFollow,
    layout = "grid",
  } = props;

  const [isModalOpen, setIsModalOpen] = useState(false);

  const thumb = useMemo(() => resolveThumbUrl(thumbnail), [thumbnail]);

  // 기본 라우팅: 라이브/녹화에 따라 자동 분기(직접 href 주면 우선)
  const computedHref = useMemo(
    () =>
      href ??
      (isLive
        ? `/streams/${id}` // 라이브는 broadcastId
        : vodIdForRecording
          ? `/streams/${vodIdForRecording}/recording` // 녹화는 vodId
          : `/streams/${id}/recording`), // fallback: 예전 방식
    [href, isLive, id, vodIdForRecording]
  );

  // FOLLOWERS 배지/오버레이 판정 (prop 우선, 없으면 visibility로 계산)
  const derivedFollowersOnly =
    typeof isFollowersOnly === "boolean"
      ? isFollowersOnly
      : visibility === STREAM_VISIBILITY.FOLLOWERS;

  // 실제 접근 잠김 상태(팔로워 잠금 or 비번 필요)
  const lockMask = useMemo(
    () => followersOnlyLocked || requiresPassword,
    [followersOnlyLocked, requiresPassword]
  );

  // startedAt를 ISO 문자열로 정규화 (formatToTimeAgo 호환)
  const startedAtIso = useMemo(() => {
    if (!startedAt) return null;
    if (startedAt instanceof Date) return startedAt.toISOString();
    if (typeof startedAt === "string") return startedAt;
    return null;
  }, [startedAt]);

  // ======== Hover/Focus 기반 Preview 로직 (IntersectionObserver 제거) ========
  const containerRef = useRef<HTMLDivElement>(null);
  const hoverTimerRef = useRef<number | null>(null);
  const [isHoveredOrFocused, setIsHoveredOrFocused] = useState(false);
  const [previewError, setPreviewError] = useState(false);
  const [thumbError, setThumbError] = useState(false);

  // 프리뷰를 띄울 자격(락이 없고 실제 라이브일 때만)
  const shouldPreview = isLive && !lockMask;

  // hover debounce: 짧은 스치기 무시
  const startHover = () => {
    if (!shouldPreview) return;
    if (hoverTimerRef.current) {
      window.clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
    hoverTimerRef.current = window.setTimeout(() => {
      setIsHoveredOrFocused(true);
      hoverTimerRef.current = null;
    }, 200);
  };

  const endHover = () => {
    if (hoverTimerRef.current) {
      window.clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
    setIsHoveredOrFocused(false);
  };

  useEffect(() => {
    return () => {
      if (hoverTimerRef.current) {
        window.clearTimeout(hoverTimerRef.current);
        hoverTimerRef.current = null;
      }
    };
  }, []);

  // 렌더 조건: 호버/포커스 중이거나(접근성 포함) 썸네일이 없을 때만 프리뷰 허용
  const shouldRenderPreview =
    shouldPreview && (isHoveredOrFocused || !thumb) && !previewError;

  const handleStreamClick = (e: React.MouseEvent) => {
    if (followersOnlyLocked) {
      e.preventDefault();
      onRequestFollow?.();
      return;
    }
    if (requiresPassword) {
      e.preventDefault();
      setIsModalOpen(true);
      return;
    }
  };

  // 키보드 접근성: Enter/Space로도 동일 동작
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      if (followersOnlyLocked || requiresPassword) {
        e.preventDefault();
        if (followersOnlyLocked) onRequestFollow?.();
        else setIsModalOpen(true);
      }
    },
    [followersOnlyLocked, requiresPassword, onRequestFollow]
  );

  // 배지: 타입별 개별 노출
  const showLive = isLive;
  const showReplay = !isLive;
  const showFollowers = derivedFollowersOnly;
  // 기본은 requiresPassword 기준, 필요 시 isPrivateType으로 강제 표시
  const showPrivate =
    typeof isPrivateType === "boolean" ? isPrivateType : requiresPassword;

  const ariaLabel = lockMask
    ? `${title} — 접근 제한(팔로워 전용 또는 비밀)`
    : title;

  const layoutClass =
    layout === "rail" ? "w-[260px] flex-none h-full" : "w-full";

  return (
    <article
      className={`relative flex flex-col overflow-hidden rounded-lg bg-white shadow dark:bg-neutral-900 ${layoutClass}`}
    >
      {/* 썸네일/영상 영역 */}
      <Link
        href={computedHref}
        className="group block"
        onClick={handleStreamClick}
        onKeyDown={handleKeyDown}
        aria-label={ariaLabel}
        aria-disabled={lockMask || undefined}
        prefetch={false}
      >
        <div
          ref={containerRef}
          className="relative aspect-video w-full bg-neutral-100 dark:bg-neutral-900"
          data-preview={shouldRenderPreview ? "true" : "false"}
          onMouseEnter={startHover}
          onMouseLeave={endHover}
          onFocus={startHover}
          onBlur={endHover}
        >
          {shouldRenderPreview ? (
            <div className="pointer-events-none absolute inset-0">
              <iframe
                src={`/streams/${id}/live-preview`}
                className="h-full w-full"
                title="Live Mini Preview"
                loading="lazy"
                tabIndex={-1}
                aria-hidden="true"
                allow="autoplay; encrypted-media; picture-in-picture"
                onError={() => {
                  console.warn("[StreamCard] live-preview iframe failed:", id);
                  setPreviewError(true);
                }}
              />
            </div>
          ) : thumb && !thumbError ? (
            <Image
              src={thumb}
              alt={title || (isLive ? "라이브 스트림 썸네일" : "녹화 썸네일")}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className={`object-cover transition-transform duration-300 group-hover:scale-[1.02] group-hover:brightness-95 ${
                lockMask ? "blur-[1.5px] brightness-90" : ""
              }`}
              loading="lazy"
              onError={() => {
                console.warn("[StreamCard] thumb image failed:", id);
                setThumbError(true);
                if (shouldPreview) setIsHoveredOrFocused(true);
              }}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-neutral-400">
              <PhotoIcon className="h-10 w-10" aria-hidden="true" />
            </div>
          )}

          {/* 배지: 좌상단에 여러 개 나란히 표기 */}
          <div className="absolute left-2 top-2 flex gap-2">
            {showLive && (
              <span className="rounded bg-red-600 px-2 py-1 text-xs font-bold text-white">
                <span className="sr-only">상태: </span>LIVE
              </span>
            )}
            {showReplay && (
              <span className="rounded bg-neutral-900/80 px-2 py-1 text-xs font-semibold text-white">
                <span className="sr-only">형식: </span>다시보기
              </span>
            )}
            {showFollowers && (
              <span className="rounded bg-indigo-700 px-2 py-1 text-xs font-semibold text-white">
                <span className="sr-only">접근: </span>팔로워
              </span>
            )}
            {showPrivate && (
              <span className="inline-flex items-center gap-1 rounded bg-amber-700 px-2 py-1 text-xs font-semibold text-white/95">
                <LockClosedIcon className="h-3.5 w-3.5" aria-hidden="true" />
                <span className="sr-only">접근: </span>비밀
              </span>
            )}
          </div>

          {/* FOLLOWERS 잠금 오버레이 (비팔로워) */}
          {followersOnlyLocked && (
            <div
              className="absolute inset-0 flex items-center justify-center bg-black/55"
              onClick={(e) => e.preventDefault()}
              aria-label="팔로워 전용 잠금"
            >
              <div className="p-4 text-center">
                <p id={`lock-msg-${id}`} className="mb-3 text-white">
                  이 방송은 팔로워만 시청할 수 있습니다.
                </p>
                {onRequestFollow && (
                  <button
                    type="button"
                    role="button"
                    aria-label="팔로우하기"
                    aria-describedby={`lock-msg-${id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      onRequestFollow();
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onRequestFollow?.();
                      }
                    }}
                    className="rounded-lg bg-primary px-4 py-2 text-white hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-white/80"
                  >
                    팔로우하기
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </Link>

      {/* 하단 정보 영역: 1) 제목 2) 유저 3) 메타 */}
      <div className="flex flex-col px-2 py-2">
        {/* 1줄: 제목 */}
        <h3 className="line-clamp-2 text-sm font-semibold text-neutral-900 dark:text-white">
          {title}
        </h3>

        {/* 유저 아바타, 닉네임 */}
        <UserAvatar
          avatar={streamer.avatar ?? null}
          username={streamer.username}
          size="sm"
          compact
        />

        {/* 3줄: 카테고리 • 태그 • 시간 */}
        {!shortDescription &&
          (category || (tags?.length ?? 0) > 0 || startedAtIso) && (
            <div
              className={`
              mt-0.5 min-w-0 flex items-center gap-2 text-[11px]
              text-neutral-600 dark:text-neutral-400 whitespace-nowrap
            `}
            >
              {category && (
                <span className="inline-flex shrink-0 items-center gap-1">
                  {category.icon && (
                    <span aria-hidden="true">{category.icon}</span>
                  )}
                  {category.kor_name}
                </span>
              )}

              {Array.isArray(tags) && tags.length > 0 && (
                <div className="flex min-w-0 items-center gap-1 overflow-hidden">
                  {tags.slice(0, 2).map((tag) => (
                    <span
                      key={tag.name}
                      className="shrink-0 rounded bg-neutral-200 px-1 dark:bg-neutral-700"
                    >
                      #{tag.name}
                    </span>
                  ))}
                  {tags.length > 2 && (
                    <span className="shrink-0 text-neutral-500 dark:text-neutral-400">
                      +{tags.length - 2}
                    </span>
                  )}
                </div>
              )}

              {startedAtIso && (
                <span className="ml-auto shrink-0 whitespace-nowrap">
                  {formatToTimeAgo(startedAtIso)}
                </span>
              )}
            </div>
          )}
      </div>

      {/* 공용 비밀번호 모달: redirectHref는 계산된 경로 사용 */}
      <PrivateAccessModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        streamId={id}
        redirectHref={computedHref}
      />
    </article>
  );
}
