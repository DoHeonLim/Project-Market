/**
 * File Name : lib/user/getUserChannel
 * Description : 채널(유저) 기본 정보 조회 + 팔로잉 여부 확인
 * Author : 임도헌
 *
 * History
 * 2025.09.19  임도헌   Created   채널 전용 경량 프로필(getUserChannel), 리다이렉트 제거
 * 2025.10.23  임도헌   Moved     app/(tabs)/profile/[username]/channel/actions → lib/user로 분리
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
