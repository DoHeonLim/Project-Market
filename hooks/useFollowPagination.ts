/**
 * File Name : hooks/useFollowPagination
 * Description : 팔로워/팔로잉 공용 페이지네이션 훅 (첫 로딩 시 viewerFollowingSet 시드)
 * Author : 임도헌
 *
 * History
 * Date        Author   Status     Description
 * 2025.10.12  임도헌   Created    followers/following 공용화 + 키셋 커서 + 중복 제거
 * 2025.10.29  임도헌   Modified   loadFirst/loadMore try-finally 도입, 실패 시 상태 복구 보강
 */

"use client";

import { useCallback, useRef, useState } from "react";
import type { FollowListUser, FollowListCursor } from "@/types/profile";

/** 서버 fetch 함수 시그니처 타입 */
type Fetcher = (
  username: string,
  opts: { cursor?: FollowListCursor; limit?: number }
) => Promise<{ users: FollowListUser[]; nextCursor: FollowListCursor }>;

interface useFollowPaginationParams {
  username: string;
  fetcher: Fetcher;
  /** 최초 로딩/더보기 시 isFollowedByViewer=true 집합을 상향 전달(세트 시드/병합용) */
  onSeedOrMerge?: (ids: number[]) => void;
  /** 기본 limit (서버 기본 20) */
  limit?: number;
}

/**
 * 팔로워/팔로잉 리스트 공용 훅
 * - 최초 open 시 한번만 로딩
 * - 더보기(loadMore) 시 중복 제거
 * - 매 로딩 때 isFollowedByViewer=true인 id들을 상향 콜백으로 전달(세트 병합)
 */
export function useFollowPagination({
  username,
  fetcher,
  onSeedOrMerge,
  limit = 20,
}: useFollowPaginationParams) {
  const [users, setUsers] = useState<FollowListUser[]>([]);
  const [cursor, setCursor] = useState<FollowListCursor>(null);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);

  const firstLoadDoneRef = useRef(false);

  const dedupMerge = useCallback(
    (prev: FollowListUser[], incoming: FollowListUser[]) => {
      const map = new Map(prev.map((u) => [u.id, u]));
      for (const u of incoming) map.set(u.id, u);
      return Array.from(map.values());
    },
    []
  );

  const loadFirst = useCallback(async () => {
    if (loaded || loading) return;
    setLoading(true);
    try {
      const res = await fetcher(username, { cursor: null, limit });
      setUsers(res.users);
      setCursor(res.nextCursor);
      setLoaded(true);

      if (!firstLoadDoneRef.current && onSeedOrMerge) {
        const followed = res.users
          .filter((u) => u.isFollowedByViewer)
          .map((u) => u.id);
        onSeedOrMerge(followed);
        firstLoadDoneRef.current = true;
      }
    } catch (e) {
      console.error("[follow] loadFirst failed:", e);
      // 실패 시 loaded=false 유지
    } finally {
      setLoading(false);
    }
  }, [fetcher, username, limit, loaded, loading, onSeedOrMerge]);

  const loadMore = useCallback(async () => {
    if (loading || !cursor) return;
    setLoading(true);
    try {
      const res = await fetcher(username, { cursor, limit });
      setUsers((prev) => dedupMerge(prev, res.users));
      setCursor(res.nextCursor);

      if (onSeedOrMerge) {
        const followed = res.users
          .filter((u) => u.isFollowedByViewer)
          .map((u) => u.id);
        onSeedOrMerge(followed);
      }
    } catch (e) {
      console.error("[follow] loadMore failed:", e);
      // 실패 시 cursor 그대로 두면 재시도 가능
    } finally {
      setLoading(false);
    }
  }, [cursor, dedupMerge, fetcher, limit, loading, onSeedOrMerge, username]);

  const upsertLocal = useCallback((user: FollowListUser) => {
    setUsers((prev) => {
      const map = new Map(prev.map((u) => [u.id, u]));
      const existed = map.has(user.id);
      map.set(user.id, user);
      const arr = Array.from(map.values());
      // 새로 생긴 경우는 맨 앞에 보이도록 살짝 조정
      if (!existed) {
        return [user, ...prev];
      }
      return arr;
    });
  }, []);

  const removeLocal = useCallback((id: number) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
  }, []);

  return {
    users,
    cursor,
    loaded,
    loading,
    loadFirst,
    loadMore,
    hasMore: !!cursor,
    upsertLocal,
    removeLocal,
  };
}
