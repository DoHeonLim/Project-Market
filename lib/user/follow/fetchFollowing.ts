/**
 * File Name : lib/user/follow/fetchFollowing
 * Description : 팔로잉 목록 페이지네이션
 * Author : 임도헌
 *
 * History
 * Date        Author   Status     Description
 * 2025.10.05  임도헌   Created
 * 2025.10.05  임도헌    Moved     app/(tabs)/profile/actions → lib/user/follow로 분리
 * 2025.10.05  임도헌   Modified   이름 정리: fetchFollowing
 * 2025.10.12  임도헌   Modified   모달 on-demand 조회 + 키셋 커서 + 상태 동반 계산
 * 2025.10.23  임도헌   Modified   username 정규화 후 즉시 id 해석, per-id 태그 규격화(user-following-id-\${id}), 캐시 키/태그 표준화
 */
"use server";

import db from "@/lib/db";
import getSession from "@/lib/session";
import { unstable_cache as nextCache } from "next/cache";
import type { FollowListUser, FollowListCursor } from "@/types/profile";

function normalizeUsername(raw: string) {
  return decodeURIComponent(raw).trim().toLowerCase();
}

// 1페이지 전용 캐시
const getFollowingPageCached = (ownerId: number, limit: number) => {
  const cached = nextCache(
    async (oid: number, take: number) =>
      db.follow.findMany({
        where: { followerId: oid },
        select: {
          id: true,
          following: { select: { id: true, username: true, avatar: true } },
        },
        orderBy: { id: "desc" },
        take,
      }),
    ["user-following-page-by-id", String(ownerId), String(limit)],
    { tags: [`user-following-id-${ownerId}`] }
  );
  return cached(ownerId, limit);
};

export async function fetchFollowing(
  username: string,
  opts: { cursor?: FollowListCursor; limit?: number } = {}
) {
  const limit = opts.limit ?? 20;
  const cursor = opts.cursor ?? null;

  const session = await getSession();
  const viewerId = session?.id ?? null;

  const owner = await db.user.findUnique({
    where: { username: normalizeUsername(username) },
    select: { id: true },
  });
  if (!owner) return { users: [], nextCursor: null };

  // 1페이지는 캐시, 이후는 비캐시
  const rows = cursor
    ? await db.follow.findMany({
        where: {
          AND: [{ followerId: owner.id }, { id: { lt: cursor.lastId! } }],
        },
        select: {
          id: true,
          following: { select: { id: true, username: true, avatar: true } },
        },
        orderBy: { id: "desc" },
        take: limit,
      })
    : await getFollowingPageCached(owner.id, limit);

  // 개인화: viewer가 rows의 사용자들을 팔로우 중인지
  const ids = rows.map((r) => r.following.id);
  let set = new Set<number>();
  if (viewerId && ids.length) {
    const hits = await db.follow.findMany({
      where: { followerId: viewerId, followingId: { in: ids } },
      select: { followingId: true },
    });
    set = new Set(hits.map((h) => h.followingId));
  }

  const users: FollowListUser[] = rows.map((r) => ({
    id: r.following.id,
    username: r.following.username,
    avatar: r.following.avatar ?? null,
    isFollowedByViewer: set.has(r.following.id),
  }));

  const tail = rows[rows.length - 1];
  const nextCursor = tail ? { lastId: tail.id } : null;

  return { users, nextCursor };
}
