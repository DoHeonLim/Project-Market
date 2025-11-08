/**
 * File Name : lib/user/getUserProfile
 * Description : 프로필 화면용 유저 프로필 조회 (followers/following + isFollowing)
 * Author : 임도헌
 *
 * History
 * Date        Author   Status     Description
 * 2025.10.05  임도헌   Created
 * 2025.10.05  임도헌   Moved      app/(tabs)/profile/actions → lib/user로 분리
 * 2025.10.05  임도헌   Modified   MyProfile 의존 필드 최소화
 * 2025.10.07  임도헌   Modified   반환 타입(UserProfile) 추가
 * 2025.10.12  임도헌   Modified   팔로우 옵션 제거(목록/Set는 전용 API로 분리), 시그니처 단순화
 * 2025.10.23  임도헌   Modified   username→id 해석 후 전 구간 id 기반으로 정리, 캐시 태그 고정화
 * 2025.10.29  임도헌   Modified   프로필 코어/팔로우 카운트 캐시 분리, username→id 얇은 캐시 추가, revalidateTag 메모 보강
 */

"use server";

import db from "@/lib/db";
import getSession from "@/lib/session";
import { redirect } from "next/navigation";
import { unstable_cache as nextCache } from "next/cache";
import type { UserProfile } from "@/types/profile";

/**
 * 캐시/무효화 메모
 * - 프로필 코어(이름/아바타/이메일 등): revalidateTag(`user-core-id-${id}`)
 * - 팔로우 카운트:                     revalidateTag(`user-followers-id-${id}`) 또는 `user-following-id-${id}`
 * - username→id 해석:                  revalidateTag(`user-username-id-${normalizedUsername}`)
 *
 * 주의: 개인화 데이터(isMe, isFollowing, viewerId)는 비캐시로 매 요청 계산.
 */

/** 입력 시그니처: 다양한 식별자를 받되, 내부에서는 id로 통일 */
export type GetUserProfileParams = {
  /** 특정 유저 id (없으면 세션 유저) */
  targetId?: number;
  /** username (라우트 인자 등). 서버에서 즉시 id로 해석 */
  username?: string;
  /** [username] 페이지에서 '본인'이면 /profile로 리다이렉트 */
  redirectIfSelfToProfile?: boolean;
};

/** username 정규화: 공백 제거 + 소문자 (정책 확장 시 NFC 등 추가 고려 가능) */
function normalizeUsername(raw: string) {
  return decodeURIComponent(raw).trim().toLowerCase();
}

/*  username → id 해석 (얇은 캐시)                                            */
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

/*  프로필 코어(id 기반) 캐시 (민감정보 포함: 이메일 등)                       */
const _getCachedUserCoreById = nextCache(
  async (id: number) =>
    db.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        avatar: true,
        email: true, // 이메일은 반환 단계에서 본인일 때만 노출
        created_at: true,
        emailVerified: true,
      },
    }),
  ["user-core-by-id"],
  { tags: [] }
);

async function getCachedUserCoreById(id: number) {
  // 동적 태그 주입(호출 시 래핑)
  const withTag = nextCache(
    (x: number) => _getCachedUserCoreById(x),
    ["user-core-by-id"],
    { tags: [`user-core-id-${id}`] }
  );
  return withTag(id);
}

/*  팔로우 카운트 캐시 (팔로우 전용 태그로 정밀 무효화)                        */
const _getCachedUserFollowCounts = nextCache(
  async (id: number) => {
    const [followers, following] = await Promise.all([
      db.follow.count({ where: { followingId: id } }),
      db.follow.count({ where: { followerId: id } }),
    ]);
    return { followers, following };
  },
  ["user-follow-counts"],
  { tags: [] }
);

async function getCachedUserFollowCounts(id: number) {
  const withTag = nextCache(
    (x: number) => _getCachedUserFollowCounts(x),
    ["user-follow-counts"],
    { tags: [`user-followers-id-${id}`, `user-following-id-${id}`] }
  );
  return withTag(id);
}

export async function getUserProfile(
  params: GetUserProfileParams = {}
): Promise<UserProfile | null> {
  const session = await getSession();
  const viewerId = session?.id ?? null;

  // 1) targetId 우선 결정 (username 있으면 즉시 해석)
  let targetId: number | null = null;

  if (typeof params.targetId === "number") {
    targetId = params.targetId;
  } else if (params.username) {
    targetId = await resolveUserIdByUsername(params.username);
    if (!targetId) return null;
  } else if (viewerId) {
    targetId = viewerId;
  } else {
    // 식별자 없음 + 비로그인
    return null;
  }

  // 2) 코어 정보 + 팔로우 카운트 병렬 취득 (각각 별도 캐시/태그)
  const [core, counts] = await Promise.all([
    getCachedUserCoreById(targetId),
    getCachedUserFollowCounts(targetId),
  ]);
  if (!core) return null;

  // 3) 자기 자신 가드/리다이렉트
  const isMe = !!viewerId && viewerId === core.id;
  if (params.redirectIfSelfToProfile && isMe) {
    redirect("/profile");
  }

  // 4) 개인화(비캐시): viewer→target 단건 관계
  let isFollowing = false;
  if (viewerId && !isMe) {
    const rel = await db.follow.findUnique({
      where: {
        followerId_followingId: { followerId: viewerId, followingId: core.id },
      },
      select: { followerId: true },
    });
    isFollowing = !!rel;
  }

  // 5) 반환 (MyProfile/UserProfile 컴포넌트 공용 형태)
  const result: UserProfile = {
    id: core.id,
    username: core.username,
    avatar: core.avatar ?? null,
    email: isMe ? (core.email ?? null) : null, // 본인이 아니면 null
    created_at: core.created_at, // 프런트가 createdAt을 기대하면 여기서 매핑 변경
    emailVerified: core.emailVerified,
    _count: { followers: counts.followers, following: counts.following },
    isMe,
    isFollowing,
    viewerId, // 낙관 표시/버튼 가드 등에서 사용
  };

  return result;
}
