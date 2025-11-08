/**
 * File Name : hooks/useFollowToggle
 * Description : 팔로우/언팔로우 API + refresh(옵션) + 서버 정합성 보정 + 델타 이벤트 발행
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2025.08.26  임도헌   Created   follow/unfollow 래핑
 * 2025.09.06  임도헌   Modified  toggle/isPending/낙관/토스트
 * 2025.10.29  임도헌   Modified  멱등/경합 롤백 처리 개선
 * 2025.10.31  임도헌   Modified  서버 정합성 보정 + 기본 refresh:false + followDelta 이벤트 발행
 */
"use client";

import { emitFollowDelta } from "@/lib/user/follow/followDeltaClient";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";

type Counts = { viewerFollowing?: number; targetFollowers?: number };

type Opts = {
  onOptimistic?(): void;
  onRollback?(): void;
  /** 기본 false: 리스트/모달 UX 보호, 필요시 상위(헤더)에서만 true */
  refresh?: boolean;
  onRequireLogin?(): void;
  onFollowersChange?(delta: number): void;
  /** 서버 기준 정합성 보정(선택) */
  onReconcileServerState?(payload: {
    isFollowing: boolean;
    counts?: Counts;
  }): void;
};

async function readJSON(r: Response) {
  try {
    return await r.json();
  } catch {
    return null;
  }
}

export function useFollowToggle() {
  const router = useRouter();
  const [pendingIds, setPendingIds] = useState<Set<number>>(new Set());

  const setPending = useCallback((userId: number, v: boolean) => {
    setPendingIds((prev) => {
      const next = new Set(prev);
      if (v) next.add(userId);
      else next.delete(userId);
      return next;
    });
  }, []);

  const isPending = useCallback(
    (id: number) => pendingIds.has(id),
    [pendingIds]
  );

  const doFollow = useCallback(async (userId: number) => {
    const r = await fetch(`/api/users/${userId}/follow`, {
      method: "POST",
      cache: "no-store",
    });
    if (r.status === 401) return { auth: false, delta: 0 as number };
    if (!r.ok) throw new Error(`FOLLOW_FAILED(${r.status})`);
    const data = await readJSON(r);
    return {
      auth: true,
      delta: Number(data?.delta ?? 0),
      isFollowing: !!data?.isFollowing,
      counts: data?.counts as Counts | undefined,
    };
  }, []);

  const doUnfollow = useCallback(async (userId: number) => {
    const r = await fetch(`/api/users/${userId}/follow`, {
      method: "DELETE",
      cache: "no-store",
    });
    if (r.status === 401) return { auth: false, delta: 0 as number };
    if (!r.ok) throw new Error(`UNFOLLOW_FAILED(${r.status})`);
    const data = await readJSON(r);
    return {
      auth: true,
      delta: Number(data?.delta ?? 0),
      isFollowing: !!data?.isFollowing,
      counts: data?.counts as Counts | undefined,
    };
  }, []);

  const toggle = useCallback(
    async (userId: number, isFollowingNow: boolean, opts?: Opts) => {
      if (isPending(userId)) return;
      setPending(userId, true);

      opts?.onOptimistic?.();
      const expected = isFollowingNow ? -1 : +1;

      try {
        const { auth, delta, isFollowing, counts } = isFollowingNow
          ? await doUnfollow(userId)
          : await doFollow(userId);

        if (!auth) {
          opts?.onRollback?.();
          opts?.onRequireLogin?.();
          toast.error("로그인이 필요합니다.");
          return;
        }

        // 1) 서버 delta 기반 토스트 · 로컬 카운트 콜백
        if (delta > 0) toast.success("팔로우했습니다.");
        else if (delta < 0) toast("언팔로우했습니다.");
        opts?.onFollowersChange?.(delta);

        // 1-a) 전역 델타 이벤트(기본)
        emitFollowDelta({
          targetUserId: userId,
          delta: (delta > 0 ? 1 : delta < 0 ? -1 : 0) as 1 | -1 | 0,
        });

        // 2) 예상과 다르면(멱등/경합): 낙관 원복 + 서버 기준 정합 보정
        if (delta !== expected) {
          opts?.onRollback?.();
          if (delta === 0) toast("이미 처리된 상태입니다.");
          if (typeof isFollowing === "boolean") {
            // 2-a) 전역 정합 이벤트(서버 기준)
            emitFollowDelta({
              targetUserId: userId,
              delta: (delta > 0 ? 1 : delta < 0 ? -1 : 0) as 1 | -1 | 0,
              server: { isFollowing, counts },
            });
            // 2-b) 호출자 보정 콜백
            opts?.onReconcileServerState?.({ isFollowing, counts });
          }
        }
      } catch (e) {
        console.error(e);
        opts?.onRollback?.();
        toast.error("요청에 실패했습니다. 잠시 후 다시 시도해주세요.");
      } finally {
        setPending(userId, false);
        const doRefresh = opts?.refresh === true; // 기본 false
        if (doRefresh) router.refresh();
      }
    },
    [doFollow, doUnfollow, isPending, router, setPending]
  );

  const follow = useCallback(
    (id: number, opts?: Opts) => toggle(id, false, opts),
    [toggle]
  );
  const unfollow = useCallback(
    (id: number, opts?: Opts) => toggle(id, true, opts),
    [toggle]
  );

  return useMemo(
    () => ({ follow, unfollow, toggle, isPending }),
    [follow, unfollow, toggle, isPending]
  );
}
