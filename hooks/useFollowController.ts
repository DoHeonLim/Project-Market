/**
 * File Name : hooks/useFollowController.ts
 * Description : 팔로우/팔로워 UI 컨트롤러 훅(토글/카운트/모달 페이징 공통화 + 델타 구독)
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2025.10.13  임도헌   Created   프로필/채널 공용 컨트롤러 훅
 * 2025.10.22  임도헌   Modified  useUserLite(viewerId) 도입
 * 2025.10.29  임도헌   Modified  서버 delta 신뢰 보정(헤더 동기화)
 * 2025.10.31  임도헌   Modified  정합성 보정 결선 + 기본 refresh:false + followDelta 구독
 */

"use client";

import { useCallback, useEffect, useState } from "react";
import { useFollowToggle } from "@/hooks/useFollowToggle";
import { useFollowPagination } from "@/hooks/useFollowPagination";
import { fetchFollowers } from "@/lib/user/follow/fetchFollowers";
import { fetchFollowing } from "@/lib/user/follow/fetchFollowing";
import type { FollowListUser } from "@/types/profile";
import { useUserLite } from "@/hooks/useUserLite";
import { onFollowDelta } from "@/lib/user/follow/followDeltaClient";

type ControllerParams = {
  ownerId: number;
  ownerUsername: string;
  initialIsFollowing: boolean;
  initialFollowerCount: number;
  initialFollowingCount: number;
  viewerId?: number; // 로그인 전제지만 방어적 체크
  onRequireLogin?: () => void; // 세션 만료 등 예외 대비
};

export function useFollowController({
  ownerId,
  ownerUsername,
  initialIsFollowing,
  initialFollowerCount,
  initialFollowingCount,
  viewerId,
  onRequireLogin,
}: ControllerParams) {
  const { toggle, isPending } = useFollowToggle();
  const { user: viewerLite } = useUserLite(viewerId, !!viewerId);

  // 헤더/상단 상태
  const [isFollowing, setIsFollowing] = useState<boolean>(initialIsFollowing);
  const [followerCount, setFollowerCount] =
    useState<number>(initialFollowerCount);
  const [followingCount, setFollowingCount] = useState<number>(
    initialFollowingCount
  );

  // 모달 페이징
  const followersList = useFollowPagination({
    username: ownerUsername,
    fetcher: fetchFollowers,
  });
  const followingList = useFollowPagination({
    username: ownerUsername,
    fetcher: fetchFollowing,
  });

  const openFollowers = useCallback(async () => {
    await followersList.loadFirst();
  }, [followersList]);

  const openFollowing = useCallback(async () => {
    await followingList.loadFirst();
  }, [followingList]);

  const isPendingById = useCallback((id: number) => isPending(id), [isPending]);

  // 헤더 토글
  const onToggleFollow = useCallback(async () => {
    if (!viewerId) return onRequireLogin?.();

    const was = isFollowing;
    await toggle(ownerId, was, {
      refresh: false,
      onOptimistic: () => setIsFollowing(!was),
      onRollback: () => setIsFollowing(was),
      onRequireLogin,
      onFollowersChange: (delta) => {
        setFollowerCount((c) => Math.max(0, c + delta));
        if (delta > 0) setIsFollowing(true);
        else if (delta < 0) setIsFollowing(false);

        if (!viewerId) return;
        if (delta > 0) {
          followersList.upsertLocal({
            id: viewerId,
            username: viewerLite?.username ?? "나",
            avatar: viewerLite?.avatar ?? null,
            isFollowedByViewer: true,
          });
        } else if (delta < 0) {
          followersList.removeLocal(viewerId);
        }
      },
      onReconcileServerState: ({ isFollowing, counts }) => {
        setIsFollowing(isFollowing);
        if (counts?.targetFollowers != null)
          setFollowerCount(counts.targetFollowers);
        if (
          viewerId &&
          viewerId === ownerId &&
          counts?.viewerFollowing != null
        ) {
          setFollowingCount(counts.viewerFollowing);
        }
      },
    });
  }, [
    isFollowing,
    ownerId,
    toggle,
    onRequireLogin,
    viewerId,
    viewerLite,
    followersList,
  ]);

  // 모달 아이템 토글
  const toggleItem = useCallback(
    async (
      user: FollowListUser,
      was: boolean,
      h: { onOptimistic: () => void; onRollback: () => void }
    ) => {
      await toggle(user.id, was, {
        refresh: false,
        onOptimistic: h.onOptimistic,
        onRollback: h.onRollback,
        onRequireLogin,
        onFollowersChange: (delta) => {
          if (user.id === ownerId) {
            setFollowerCount((c) => Math.max(0, c + delta));
            setIsFollowing((prev) =>
              delta > 0 ? true : delta < 0 ? false : prev
            );
          }
        },
        onReconcileServerState: ({ isFollowing, counts }) => {
          if (user.id === ownerId) {
            setIsFollowing(isFollowing);
            if (counts?.targetFollowers != null)
              setFollowerCount(counts.targetFollowers);
          }
        },
      });
    },
    [toggle, onRequireLogin, ownerId]
  );

  // 공용 델타 구독: 동일 오너에 대한 변화에 전역 동기화
  useEffect(() => {
    const off = onFollowDelta(({ targetUserId, delta, server }) => {
      if (targetUserId !== ownerId) return;

      // 1) 헤더 상태/카운트
      if (server?.counts?.targetFollowers != null) {
        setFollowerCount(server.counts.targetFollowers);
      } else if (delta !== 0) {
        setFollowerCount((c) => Math.max(0, c + delta));
      }

      if (server?.isFollowing != null) {
        setIsFollowing(server.isFollowing);
      } else if (delta !== 0) {
        setIsFollowing(delta > 0 ? true : false);
      }

      // 2) 팔로워 모달(내가 오너를 팔로우/언팔)
      if (viewerId) {
        if (delta > 0) {
          followersList.upsertLocal({
            id: viewerId,
            username: viewerLite?.username ?? "나",
            avatar: viewerLite?.avatar ?? null,
            isFollowedByViewer: true,
          });
        } else if (delta < 0) {
          followersList.removeLocal(viewerId);
        }
      }

      // 3) 내 프로필일 때 내 following 카운트는,
      //    - 로컬 토글 결과(onViewerFollowChange)에서 +1/-1
      //    - 또는 서버가 명시 값(viewerFollowing)을 보낼 때만 교체
      if (
        viewerId &&
        viewerId === ownerId &&
        server?.counts?.viewerFollowing != null
      ) {
        setFollowingCount(server.counts.viewerFollowing);
      }
    });

    return off;
  }, [
    ownerId,
    viewerId,
    viewerLite?.username,
    viewerLite?.avatar,
    followersList,
  ]);

  return {
    // 화면 표시용 상태
    isFollowing,
    followerCount,
    followingCount,
    isPending: isPending(ownerId),
    // 액션
    openFollowers,
    openFollowing,
    onToggleFollow,
    toggleItem,
    isPendingById,
    // 모달 데이터/콜백
    followersList,
    followingList,
    onViewerFollowChange: useCallback(
      (changedUser: FollowListUser, now: boolean) => {
        followersList.upsertLocal({
          id: changedUser.id,
          username: changedUser.username,
          avatar: changedUser.avatar ?? null,
          isFollowedByViewer: now,
        });

        if (now) {
          followingList.upsertLocal({
            id: changedUser.id,
            username: changedUser.username,
            avatar: changedUser.avatar ?? null,
            isFollowedByViewer: true,
          });
        } else {
          followingList.removeLocal(changedUser.id);
        }

        if (changedUser.id === ownerId) {
          setFollowerCount((c) => Math.max(0, c + (now ? +1 : -1)));
          setIsFollowing(now);
        }

        if (viewerId && viewerId === ownerId) {
          setFollowingCount((c) => Math.max(0, c + (now ? +1 : -1)));
        }
      },
      [followersList, followingList, ownerId, viewerId]
    ),
  };
}
