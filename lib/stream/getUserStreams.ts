/**
 * File Name : lib/stream/getUserStreams
 * Description : 유저 채널 스트림 목록 (Broadcast 스키마 / 가시성/정렬/페이징)
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2025.07.30  임도헌   Created   유저 스트리밍 목록 조회 로직 분리
 * 2025.08.09  임도헌   Modified  역할군 + 가시성 필터 + 티저 플래그 추가
 * 2025.08.27  임도헌   Modified  비소유자도 PRIVATE의 ENDED(다시보기) 노출
 * 2025.10.23  임도헌   Modified  ownerId 우선, username→id 해석; per-id 태그; ROLE 캐시 버킷 2단계(owner/public); nextCursor 추가
 * 2025.10.29  임도헌   Modified  unstable_cache 키에 take/cursor 반영(1p만 캐시), username→id 얇은 캐시 + 태그 추가
 * 2025.11.26  임도헌   Modified  latestVodId(가장 최신 VodAsset id) DTO에 추가
 */

import "server-only";
import db from "@/lib/db";
import { unstable_cache as nextCache } from "next/cache";
import { Prisma } from "@prisma/client";
import { getViewerRole } from "./getViewerRole";
import type { ViewerRole } from "@/types/stream";

/** 입력은 ownerId 권장, username은 호환용(서버에서 즉시 id 해석) */
type GetUserStreamsParams =
  | {
      ownerId: number;
      viewerId?: number | null;
      take?: number;
      cursor?: number;
    }
  | {
      username: string;
      viewerId?: number | null;
      take?: number;
      cursor?: number;
    };

/* username → id 해석 (얇은 캐시)                                             */
function normalizeUsername(raw: string) {
  return decodeURIComponent(raw).trim().toLowerCase().normalize("NFC");
}

// 내부 코어 캐시(고정 키), 호출 시 동적 태그를 얹는 패턴
const _resolveUserIdByUsername = nextCache(
  async (username: string) => {
    const u = await db.user.findUnique({
      where: { username },
      select: { id: true },
    });
    return u?.id ?? null;
  },
  ["user-username-resolve"],
  { tags: [] }
);

async function resolveUserIdByUsername(username: string) {
  const uname = normalizeUsername(username);
  const withTag = nextCache(
    (u: string) => _resolveUserIdByUsername(u),
    ["user-username-resolve"],
    { tags: [`user-username-id-${uname}`] }
  );
  return withTag(uname);
}

/* where/select 공통화                                                        */
function buildWhere(
  ownerId: number,
  bucket: "owner" | "public",
  cursor?: number
): Prisma.BroadcastWhereInput {
  const baseWhere: Prisma.BroadcastWhereInput = {
    liveInput: { userId: ownerId },
  };
  const cursorFilter: Prisma.BroadcastWhereInput = cursor
    ? { id: { lt: cursor } }
    : {};
  if (bucket === "owner") return { ...baseWhere, ...cursorFilter };

  // non-owner: PUBLIC + FOLLOWERS + (PRIVATE & ENDED)
  const nonOwnerVisibility: Prisma.BroadcastWhereInput = {
    OR: [
      { visibility: "PUBLIC" },
      { visibility: "FOLLOWERS" },
      { visibility: "PRIVATE", status: "ENDED" },
    ],
  };
  return { ...baseWhere, ...nonOwnerVisibility, ...cursorFilter };
}

const broadcastSelect = {
  id: true,
  title: true,
  description: true,
  thumbnail: true,
  visibility: true,
  status: true,
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

  // 가장 최신 VodAsset 1개만 필요 (녹화 페이지 라우팅용 latestVodId)
  vodAssets: {
    select: { id: true, ready_at: true },
    orderBy: [{ ready_at: "desc" }, { id: "desc" }],
    take: 1,
  },
} satisfies Prisma.BroadcastSelect;

// 1페이지 캐시(페이징 없는 첫 페이지만 캐시)
// - 태그: user-streams-id-${ownerId}
// - KEY: ["user-streams-by-owner", ownerId, bucket, take]
//  - cursor가 있으면 비캐시 경로로 우회

function getCachedUserStreamsFirstPage(
  ownerId: number,
  bucket: "owner" | "public",
  take: number
) {
  return nextCache(
    async (oid: number, bkt: "owner" | "public", tk: number) => {
      const rows = await db.broadcast.findMany({
        where: buildWhere(oid, bkt),
        select: broadcastSelect,
        orderBy: { id: "desc" },
        take: tk,
      });
      return rows;
    },
    ["user-streams-by-owner", String(ownerId), bucket, String(take)],
    { tags: [`user-streams-id-${ownerId}`] }
  );
}

export async function getUserStreams(params: GetUserStreamsParams) {
  // 1) ownerId 확정 (username이 왔다면 얇은 캐시로 해석)
  let ownerId: number | null = null;
  if ("ownerId" in params) {
    ownerId = params.ownerId;
  } else {
    ownerId = await resolveUserIdByUsername(params.username);
    if (!ownerId) {
      return {
        items: [],
        role: "VISITOR" as ViewerRole,
        owner: null,
        nextCursor: null,
      };
    }
  }

  const take = Math.max(1, Math.min(params.take ?? 30, 60)); // 안전 클램프
  const cursor = params.cursor;

  // 2) ROLE 계산(비캐시) → 캐시 버킷 축약
  const role = await getViewerRole(params.viewerId ?? null, ownerId);
  const bucket: "owner" | "public" = role === "OWNER" ? "owner" : "public";

  // 3) 조회: cursor가 있으면 비캐시(페이징), 없으면 1페이지 캐시
  let rows;
  if (cursor) {
    rows = await db.broadcast.findMany({
      where: buildWhere(ownerId, bucket, cursor),
      select: broadcastSelect,
      orderBy: { id: "desc" },
      take,
    });
  } else {
    rows = await getCachedUserStreamsFirstPage(ownerId, bucket, take)(
      ownerId,
      bucket,
      take
    );
  }

  // 4) DTO 매핑 + nextCursor
  const items = rows.map((b) => {
    const latestVod = b.vodAssets[0] ?? null;

    return {
      id: b.id,
      title: b.title,
      description: b.description,
      thumbnail: b.thumbnail ?? null,
      visibility: b.visibility,
      status: b.status,
      isLive: b.status === "CONNECTED",
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
      tags: b.tags,
      requiresPassword: b.visibility === "PRIVATE" && role !== "OWNER",
      followersOnlyLocked: b.visibility === "FOLLOWERS" && role === "VISITOR",
      locked: b.visibility === "FOLLOWERS" && role === "VISITOR",

      // 가장 최신 VodAsset id (녹화 상세로 이동할 때 사용)
      latestVodId: latestVod?.id ?? null,
    };
  });

  const nextCursor = items.length === take ? items[items.length - 1].id : null;
  const owner = { id: ownerId }; // 호환용 메타

  return { items, role, owner, nextCursor };
}

/** 정밀 무효화 예시
 * - 방송 시작/종료/삭제/가시성 변경 등 이벤트 후:
 *   await revalidateTag(`user-streams-id-${ownerId}`);
 * - username 변경 이벤트가 있다면:
 *   await revalidateTag(`user-username-id-${normalizedUsername}`);
 */
