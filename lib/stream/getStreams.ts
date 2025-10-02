/**
 * File Name : lib/stream/getStreams
 * Description : 라이브 스트리밍 리스트 조회 (Broadcast 스키마)
 * Author : 임도헌
 *
 * History
 * 2025.09.17 임도헌 Created Broadcast 기준으로 재구현 + 직렬화 유틸 적용
 * 2025.09.17 임도헌 Modified 불필요한 scopeFilter 제거, where 인라인 분기
 * 2025.09.23 임도헌 Modified serializeStream 최신 스펙 반영(stream_id/ended_at)
 * 2025.09.30 임도헌 Modified 상위 카테고리 클릭 시 하위 카테고리 포함 필터링
 */

import "server-only";
import db from "@/lib/db";
import { serializeStream } from "@/lib/stream/serializeStream";
import type { BroadcastSummary, StreamVisibility } from "@/types/stream";

type Scope = "all" | "following";

export async function getStreams(params: {
  scope: Scope;
  category?: string;
  keyword?: string;
  viewerId: number | null;
  cursor: number | null; // id < cursor
  take: number; // TAKE(+1) 권장
}): Promise<BroadcastSummary[]> {
  const { scope, category, keyword, viewerId, cursor, take } = params;

  // 비로그인 + following 탭 → 빈 결과 (팔로잉 탭은 로그인 필요)
  if (scope === "following" && !viewerId) return [];

  // 기본: 방송 중만
  const whereBase = {
    status: "CONNECTED",
  };

  // 카테고리: 본인 또는 parent가 해당 카테고리 (하위 포함)
  const categoryCondition = category
    ? {
        OR: [
          { category: { eng_name: category } }, // 본인이 해당 카테고리
          { category: { parent: { eng_name: category } } }, // 부모가 해당 카테고리
        ],
      }
    : undefined;

  // 키워드: 제목/설명/유저/태그
  const kw = keyword?.trim();
  const keywordFilter = kw
    ? {
        OR: [
          { title: { contains: kw, mode: "insensitive" as const } },
          { description: { contains: kw, mode: "insensitive" as const } },
          {
            liveInput: {
              user: {
                username: { contains: kw, mode: "insensitive" as const },
              },
            },
          },
          {
            tags: {
              some: {
                name: { contains: kw, mode: "insensitive" as const },
              },
            },
          },
        ],
      }
    : {};

  // 커서
  const idCursor = cursor ? { lt: cursor } : {};

  // === 접근 제어 조건 구성 ===
  let where: any;

  if (scope === "following") {
    // following 탭: 팔로우하는 유저의 방송만
    const conditions: any[] = [
      whereBase,
      keywordFilter,
      { id: idCursor },
      {
        liveInput: {
          user: {
            followers: { some: { followerId: viewerId! } },
          },
        },
      },
      {
        visibility: {
          in: ["PUBLIC", "FOLLOWERS", "PRIVATE"] as StreamVisibility[],
        },
      },
    ];

    if (categoryCondition) {
      conditions.push(categoryCondition);
    }

    where = {
      AND: conditions.filter((c) => Object.keys(c).length > 0),
    };
  } else {
    // scope === "all"
    if (viewerId) {
      // 로그인 상태
      const conditions: any[] = [
        whereBase,
        keywordFilter,
        { id: idCursor },
        {
          OR: [
            { visibility: "PUBLIC" },
            {
              AND: [
                { visibility: "FOLLOWERS" },
                {
                  liveInput: {
                    user: {
                      followers: { some: { followerId: viewerId } },
                    },
                  },
                },
              ],
            },
            { visibility: "PRIVATE" },
          ],
        },
      ];

      if (categoryCondition) {
        conditions.push(categoryCondition);
      }

      where = {
        AND: conditions.filter((c) => Object.keys(c).length > 0),
      };
    } else {
      // 비로그인
      const conditions: any[] = [
        whereBase,
        keywordFilter,
        { id: idCursor },
        {
          OR: [{ visibility: "PUBLIC" }, { visibility: "PRIVATE" }],
        },
      ];

      if (categoryCondition) {
        conditions.push(categoryCondition);
      }

      where = {
        AND: conditions.filter((c) => Object.keys(c).length > 0),
      };
    }
  }

  const rows = await db.broadcast.findMany({
    where,
    select: {
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
          userId: true,
          provider_uid: true,
          user: {
            select: {
              id: true,
              username: true,
              avatar: true,
              // isFollowing 계산을 위해 viewer가 있을 때만 followers 조회
              ...(viewerId
                ? {
                    followers: {
                      where: { followerId: viewerId },
                      select: { id: true },
                      take: 1,
                    },
                  }
                : {}),
            },
          },
        },
      },
      category: {
        select: { id: true, kor_name: true, icon: true },
      },
      tags: { select: { name: true } },
    },
    orderBy: { id: "desc" },
    take,
  });

  const mapped: BroadcastSummary[] = rows.map((b) => {
    const isMine = !!viewerId && b.liveInput.userId === viewerId;
    const isFollowing =
      !!viewerId &&
      Array.isArray(b.liveInput.user.followers) &&
      b.liveInput.user.followers.length > 0;

    return serializeStream(
      {
        id: b.id,
        stream_id: b.liveInput.provider_uid,
        title: b.title,
        description: b.description,
        thumbnail: b.thumbnail,
        visibility: b.visibility as StreamVisibility,
        status: b.status,
        started_at: b.started_at,
        ended_at: b.ended_at ?? null,
        userId: b.liveInput.userId,
        user: {
          id: b.liveInput.user.id,
          username: b.liveInput.user.username,
          avatar: b.liveInput.user.avatar,
        },
        category: b.category
          ? {
              id: b.category.id,
              kor_name: b.category.kor_name,
              icon: b.category.icon,
            }
          : null,
        tags: b.tags ?? [],
      },
      { isFollowing, isMine }
    );
  });

  return mapped;
}
