/**
File Name : components/productDetail/ProductDetailMeta
Description : 제품 판매자 정보 및 생성일 표시 컴포넌트
Author : 임도헌

History
Date        Author   Status    Description
2025.06.08  임도헌   Created   판매자 프로필 및 생성일 컴포넌트 분리
*/

"use client";

import UserAvatar from "@/components/common/UserAvatar";
import TimeAgo from "@/components/common/TimeAgo";

interface ProductDetailMetaProps {
  username: string;
  avatar: string | null;
  created_at: string;
}

export default function ProductDetailMeta({
  username,
  avatar,
  created_at,
}: ProductDetailMetaProps) {
  return (
    <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50">
      <div className="flex items-center gap-2">
        <span className="text-sm text-neutral-500">⚓ 판매 선원</span>
        <UserAvatar avatar={avatar} username={username} size="sm" />
      </div>
      <TimeAgo date={created_at} />
    </div>
  );
}
