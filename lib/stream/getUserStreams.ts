/**
 * File Name : lib/stream/getUserStreams
 * Description : 유저 채널 스트림 목록 (Broadcast 스키마 / 가시성/정렬/페이징)
 * Author : 임도헌
 */

import "server-only";
import db from "@/lib/db";
import { Prisma } from "@prisma/client";
import { getViewerRole, type ViewerRole } from "./getViewerRole";

interface GetUserStreamsParams {
  username: string;
  viewerId?: number | null;
  take?: number;
  cursor?: number; // Broadcast.id (id DESC 페이지네이션: id < cursor)
}

/**
 * 정책
 * - OWNER: 모든 가시성(PUBLIC/FOLLOWERS/PRIVATE)
 * - FOLLOWER: PUBLIC + FOLLOWERS + (PRIVATE & ENDED)
 * - VISITOR: PUBLIC + FOLLOWERS(티저) + (PRIVATE & ENDED)
 *   → PRIVATE (라이브/진행중)은 노출하지 않음
 */
export async function getUserStreams({
  username,
  viewerId = null,
  take = 30,
  cursor,
}: GetUserStreamsParams) {
  // 1) 채널 소유자
  const owner = await db.user.findUnique({
    where: { username: decodeURIComponent(username) },
    select: {
      id: true,
      username: true,
      avatar: true,
      _count: { select: { followers: true, following: true } },
    },
  });
  if (!owner) return { items: [], role: "VISITOR" as ViewerRole, owner: null };

  // 2) 뷰어 역할
  const role = await getViewerRole(viewerId, owner.id);

  // 3) where 구성 (명시적으로 Prisma 타입 사용)
  const ownerWhere: Prisma.BroadcastWhereInput = {
    liveInput: { userId: owner.id },
  };
  const cursorFilter: Prisma.BroadcastWhereInput = cursor
    ? { id: { lt: cursor } }
    : {};

  // PUBLIC/FOLLOWERS 항상 노출, PRIVATE은 ENDED만
  const nonOwnerVisibility: Prisma.BroadcastWhereInput = {
    OR: [
      { visibility: "PUBLIC" },
      { visibility: "FOLLOWERS" },
      { visibility: "PRIVATE", status: "ENDED" },
    ],
  };

  const where: Prisma.BroadcastWhereInput =
    role === "OWNER"
      ? { ...ownerWhere, ...cursorFilter }
      : { ...ownerWhere, ...nonOwnerVisibility, ...cursorFilter };

  // 4) 조회 (liveInput 관계 포함해서 타입 에러 방지)
  const rows = await db.broadcast.findMany({
    where,
    select: {
      id: true,
      title: true,
      description: true,
      thumbnail: true,
      visibility: true, // "PUBLIC" | "FOLLOWERS" | "PRIVATE"
      status: true, // "CONNECTED" | "ENDED" | ...
      started_at: true,
      ended_at: true,
      liveInput: {
        select: {
          provider_uid: true,
          user: { select: { id: true, username: true, avatar: true } },
        },
      },
      category: { select: { id: true, kor_name: true, icon: true } },
      tags: { select: { name: true } },
    },
    orderBy: { id: "desc" },
    take,
  });

  // 5) 카드/그리드에서 바로 쓰도록 보강
  const items = rows.map((b) => {
    const isFollowersOnly = b.visibility === "FOLLOWERS";
    const followersOnlyLocked = isFollowersOnly && role === "VISITOR";
    const requiresPassword = b.visibility === "PRIVATE" && role !== "OWNER";

    return {
      id: b.id,
      title: b.title,
      description: b.description,
      thumbnail: b.thumbnail ?? null,
      visibility: b.visibility,
      status: b.status,
      started_at: b.started_at,
      ended_at: b.ended_at,
      stream_id: b.liveInput.provider_uid,
      user: {
        id: b.liveInput.user.id,
        username: b.liveInput.user.username,
        avatar: b.liveInput.user.avatar ?? null,
      },
      category: b.category
        ? {
            id: b.category.id,
            kor_name: b.category.kor_name,
            icon: b.category.icon ?? null,
          }
        : null,
      tags: b.tags ?? [],
      requiresPassword,
      followersOnlyLocked,
      locked: followersOnlyLocked, // (레거시 호환 필요 시 유지)
    };
  });

  return { items, role, owner };
}
