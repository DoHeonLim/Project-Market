/**
File Name : components/profile/ReservationUserInfo
Description : 예약자 정보 컴포넌트
Author : 임도헌

History
Date        Author   Status    Description
2024.12.04  임도헌   Created
2024.12.04  임도헌   Modified  예약자 정보 컴포넌트 추가
2024.12.07  임도헌   Modified  프로필 이미지 컴포넌트 분리
2024.12.22  임도헌   Modified  함수명 변경
2025.11.02  임도헌   Modified  프리뷰(fallback) 옵션 추가
*/
"use client";
import { useEffect, useState } from "react";
import UserAvatar from "../common/UserAvatar";
import { getUserInfo } from "@/lib/user/getUserInfo";

export default function ReservationUserInfo({
  userId,
  fallback, // 카드에서 내려보낸 프리뷰(있으면 fetch 생략)
}: {
  userId: number | null;
  fallback?: { username: string; avatar: string | null } | null;
}) {
  const [user, setUser] = useState(fallback ?? null);
  useEffect(() => {
    if (!userId || user) return;
    let mounted = true;
    (async () => {
      const info = await getUserInfo(userId);
      if (mounted && info) setUser(info);
    })();
    return () => {
      mounted = false;
    };
  }, [userId, user]);
  if (!user) return null;
  return (
    <div className="flex items-center gap-3">
      <span className="dark:text-white">예약자</span>
      <UserAvatar avatar={user.avatar} username={user.username} size="md" />
    </div>
  );
}
