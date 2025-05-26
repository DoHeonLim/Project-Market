/**
File Name : components/chat/UnreadMessageCountBadge
Description : 읽지 않은 메시지 갯수 표시 컴포넌트
Author : 임도헌

History
Date        Author   Status    Description
2024.11.15  임도헌   Created
2024.11.15  임도헌   Modified  읽지 않은 메시지 갯수 표시 컴포넌트 추가
2024.12.20  임도헌   Modified  클라이언트 컴포넌트로 수정

*/

"use client";

import { useEffect, useState } from "react";
import { unreadMessageCountDB } from "@/app/(tabs)/chat/actions";

export default function UnreadMessageCountBadge({
  id,
  productChatRoomId,
}: {
  id: number;
  productChatRoomId: string;
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    unreadMessageCountDB(id, productChatRoomId)
      .then(setCount)
      .catch(() => setCount(0));
  }, [id, productChatRoomId]);

  if (count === 0) return null;

  return (
    <div className="flex items-center justify-center size-5 bg-red-500 rounded-full">
      <span className="text-white text-sm">{count}</span>
    </div>
  );
}
