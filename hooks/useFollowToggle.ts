/**
 * File Name : hooks/useFollowToggle
 * Description : 팔로우/언팔로우 API + refresh
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2025.08.26  임도헌   Created   follow/unfollow 래핑
 * 2025.09.06  임도헌   Modified  toggle/isPending/낙관적 업데이트/토스트 추가
 */
"use client";

import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";

type Opts = {
  onOptimistic?(): void;
  onRollback?(): void;
  refresh?: boolean; // 기본 true
  onRequireLogin?(): void;
  onFollowersChange?(delta: number): void; // 변경된 이름 하나만 사용
};

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
    (userId: number) => pendingIds.has(userId),
    [pendingIds]
  );

  const follow = useCallback(
    async (userId: number, opts?: Opts) => {
      if (isPending(userId)) return;
      setPending(userId, true);
      opts?.onOptimistic?.();
      try {
        const r = await fetch(`/api/users/${userId}/follow`, {
          method: "POST",
          cache: "no-store",
        });
        if (!r.ok) {
          const body = (await r.text().catch(() => "")) || "";
          // 이미 팔로우 상태면 멱등 처리(증감 없음)
          if (r.status === 400 && /already/i.test(body)) return;
          if (r.status === 401) {
            opts?.onRollback?.();
            opts?.onRequireLogin?.();
            toast.error("로그인이 필요합니다.");
            return;
          }
          throw new Error(body || "FOLLOW_FAILED");
        }
        toast.success("팔로우했습니다.");
        opts?.onFollowersChange?.(+1); // 성공 시 +1
      } catch (e) {
        console.error(e);
        opts?.onRollback?.();
        toast.error("팔로우에 실패했습니다. 잠시 후 다시 시도해주세요.");
      } finally {
        setPending(userId, false);
        if (opts?.refresh !== false) router.refresh();
      }
    },
    [isPending, router, setPending]
  );

  const unfollow = useCallback(
    async (userId: number, opts?: Opts) => {
      if (isPending(userId)) return;
      setPending(userId, true);
      opts?.onOptimistic?.();
      try {
        const r = await fetch(`/api/users/${userId}/follow`, {
          method: "DELETE",
          cache: "no-store",
        });
        if (!r.ok) {
          const body = (await r.text().catch(() => "")) || "";
          // 이미 언팔 상태면 멱등 처리(증감 없음)
          if (r.status === 404 || (r.status === 400 && /not/i.test(body)))
            return;
          if (r.status === 401) {
            opts?.onRollback?.();
            opts?.onRequireLogin?.();
            toast.error("로그인이 필요합니다.");
            return;
          }
          throw new Error(body || "UNFOLLOW_FAILED");
        }
        toast("언팔로우했습니다.");
        opts?.onFollowersChange?.(-1); // 성공 시 -1
      } catch (e) {
        console.error(e);
        opts?.onRollback?.();
        toast.error("언팔로우에 실패했습니다. 잠시 후 다시 시도해주세요.");
      } finally {
        setPending(userId, false);
        if (opts?.refresh !== false) router.refresh();
      }
    },
    [isPending, router, setPending]
  );

  const toggle = useCallback(
    async (userId: number, isFollowing: boolean, opts?: Opts) =>
      isFollowing ? unfollow(userId, opts) : follow(userId, opts),
    [follow, unfollow]
  );

  return useMemo(
    () => ({ follow, unfollow, toggle, isPending }),
    [follow, unfollow, toggle, isPending]
  );
}
