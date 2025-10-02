/**
 * File Name : app/(tabs)/profile/[username]/channel/actions
 * Description : 채널(유저) 기본 정보 조회 + 팔로잉 여부 확인
 * Author : 임도헌
 *
 * History
 * 2025.09.19  임도헌   Created   채널 전용 경량 프로필(getUserChannel), 리다이렉트 제거
 */
"use server";

import db from "@/lib/db";
import { notFound } from "next/navigation";

/** 채널 전용 경량 프로필 (카운트만 포함) */
export const getUserChannel = async (username: string) => {
  const decoded = decodeURIComponent(username);

  const user = await db.user.findUnique({
    where: { username: decoded },
    select: {
      id: true,
      username: true,
      avatar: true,
      created_at: true,
      _count: { select: { followers: true, following: true } },
    },
  });

  if (!user) notFound();
  return user;
};

/** viewer가 channel owner를 팔로우 중인지 확인 */
export async function getIsFollowing(
  followerId: number,
  followingId: number
): Promise<boolean> {
  if (!followerId || !followingId) return false;
  if (followerId === followingId) return true; // 자기 자신은 true로 처리(UX 단순화)
  const follow = await db.follow.findUnique({
    where: { followerId_followingId: { followerId, followingId } },
    select: { followerId: true },
  });
  return !!follow;
}
