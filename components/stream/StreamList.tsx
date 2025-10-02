/**
 * File Name : components/stream/StreamList
 * Description : 스트리밍 카드 리스트 + 자체 무한스크롤 상태 (URL 탭 구조 호환)
 * Author : 임도헌
 *
 * History
 * 2025.08.25  임도헌   Created   StreamCard 호환 + 내부 페이지네이션 내장
 * 2025.08.26  임도헌   Modified  usePageVisibility + 새 useInfiniteScroll 옵션 추가
 * 2025.09.10  임도헌   Modified  append 중복 방지(Map), 에러 메시지/aria 보강, 사소한 정리
 * 2025.09.17  임도헌   Modified  StreamCardItem 필드(startedAt/isLive) 정합화, append 병합 정리
 * 2025.09.17  임도헌   Modified  BroadcastSummary로 변경
 */

"use client";

import { useEffect, useRef, useState } from "react";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { getMoreStreams } from "@/app/(tabs)/streams/actions/init";
import StreamCard from "./StreamCard";
import type { BroadcastSummary } from "@/types/stream";
import { usePageVisibility } from "@/hooks/usePageVisibility";

type Scope = "all" | "following";

interface StreamListProps {
  scope: Scope;
  searchParams: { category?: string; keyword?: string };
  initialItems: BroadcastSummary[];
  initialCursor: number | null;
  onRequestFollow?: (streamer: { id: number; username: string }) => void;
  viewerId?: number | null;
}

export default function StreamList({
  scope,
  searchParams,
  initialItems,
  initialCursor,
  onRequestFollow,
  viewerId = null,
}: StreamListProps) {
  const [items, setItems] = useState<BroadcastSummary[]>(initialItems);
  const [cursor, setCursor] = useState<number | null>(initialCursor);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState<boolean>(initialCursor !== null);
  const [error, setError] = useState<string | null>(null);

  // 검색 파라미터 변경 시 리스트 상태 리셋
  useEffect(() => {
    setItems(initialItems);
    setCursor(initialCursor);
    setHasMore(initialCursor !== null);
    setError(null);
  }, [initialItems, initialCursor]);

  const triggerRef = useRef<HTMLDivElement>(null);
  const isVisible = usePageVisibility();

  // 빈 문자열 방지(서버 액션에서 또 한번 정규화하지만 여기서도 가볍게)
  const category = (searchParams.category || "").trim();
  const keyword = (searchParams.keyword || "").trim();

  useInfiniteScroll({
    triggerRef,
    hasMore,
    isLoading,
    onLoadMore: async () => {
      if (isLoading || !hasMore) return;
      setIsLoading(true);
      setError(null);
      try {
        const data = await getMoreStreams(
          scope,
          cursor,
          { category, keyword },
          viewerId
        );

        if (data.streams.length > 0) {
          setItems((prev) => {
            const map = new Map<number, BroadcastSummary>();
            // 기존 유지
            for (const v of prev) map.set(v.id, v);
            // 신규 반영(덮어쓰기)
            for (const v of data.streams) map.set(v.id, v);
            // order: 기존 + 신규(기존에 없던 것만 뒤에 추가)
            const next = [...prev];
            for (const v of data.streams)
              if (!next.find((p) => p.id === v.id)) next.push(v);
            // 위 로직은 신규가 기존과 겹칠 경우 기존 위치 유지, 새로운 항목만 뒤에 붙임
            return next;
          });
        }

        setCursor(data.nextCursor);
        setHasMore(data.nextCursor !== null);
      } catch (e) {
        console.error("Failed to load more streams:", e);
        setError("목록을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.");
      } finally {
        setIsLoading(false);
      }
    },
    enabled: isVisible,
    rootMargin: "1200px 0px 0px 0px",
    threshold: 0.01,
  });

  return (
    <>
      <div className="grid grid-cols-2 gap-4 px-4 py-4">
        {items.map((s) => {
          const startedAt =
            typeof s.started_at === "string" ? s.started_at : null;

          const tags =
            Array.isArray(s.tags) && s.tags.length > 0
              ? typeof (s.tags as any)[0] === "string"
                ? (s.tags as any).map((name: string) => ({ name }))
                : s.tags
              : [];

          return (
            <StreamCard
              key={s.id}
              id={s.id}
              title={s.title}
              thumbnail={s.thumbnail ?? null}
              isLive={!!s.isLive}
              streamer={{
                username: s.user.username,
                avatar: s.user.avatar ?? null,
              }}
              startedAt={startedAt ?? null}
              category={s.category}
              tags={tags as { name: string }[]}
              requiresPassword={s.requiresPassword}
              isFollowersOnly={s.visibility === "FOLLOWERS"}
              followersOnlyLocked={s.followersOnlyLocked}
              onRequestFollow={
                onRequestFollow
                  ? () =>
                      onRequestFollow({
                        id: s.user.id,
                        username: s.user.username,
                      })
                  : undefined
              }
            />
          );
        })}
      </div>

      {isLoading && (
        <div
          className="px-4 pb-12 text-center text-neutral-500"
          role="status"
          aria-live="polite"
        >
          불러오는 중...
        </div>
      )}

      {error && (
        <div className="px-4 pb-6 text-center text-rose-500" role="alert">
          {error}
        </div>
      )}

      {/* 인터섹션 센티넬 */}
      <div ref={triggerRef} className="h-8" aria-hidden="true" />
    </>
  );
}
