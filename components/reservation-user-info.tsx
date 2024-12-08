/**
File Name : components/my-salse-product-item
Description : 나의 판매 제품 상세 컴포넌트
Author : 임도헌

History
Date        Author   Status    Description
2024.12.04  임도헌   Created
2024.12.04  임도헌   Modified  예약자 정보 컴포넌트 추가
2024.12.07  임도헌   Modified  프로필 이미지 컴포넌트 분리
*/
"use client";
import { getReservationUserInfo } from "@/app/(tabs)/profile/(product)/my-sales/actions";
import { useEffect, useState } from "react";
import UserAvatar from "./user-avatar";

interface User {
  username: string;
  avatar: string | null;
}

export default function ReservationUserInfo({
  userId,
}: {
  userId: number | null;
}) {
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => {
    if (!userId) return;

    const fetchUser = async () => {
      const user = await getReservationUserInfo(userId);
      setUser(user);
    };

    fetchUser();
  }, [userId]);
  if (!user) return null;

  return (
    <>
      <div className="flex items-center gap-3">
        <span>예약자</span>
        <UserAvatar avatar={user.avatar} username={user.username} size="md" />
      </div>
    </>
  );
}
