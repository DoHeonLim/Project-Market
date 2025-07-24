/**
 * File Name : components/chat/chatRoomCard/ChatRoomThumbnail
 * Description : 채팅방 제품 썸네일 컴포넌트
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2025.07.15  임도헌   Created   제품 썸네일 컴포넌트 분리
 * 2025.07.24  임도헌   Modified  BoardPort 스타일 적용
 */
"use client";

import Image from "next/image";

interface ChatRoomThumbnailProps {
  product: {
    imageUrl: string;
    title: string;
  };
}

export default function ChatRoomThumbnail({ product }: ChatRoomThumbnailProps) {
  return (
    <div className="relative size-12 flex-shrink-0 rounded-md overflow-hidden bg-neutral-100 dark:bg-neutral-800">
      <Image
        src={`${product.imageUrl}/avatar`}
        alt={product.title}
        fill
        className="object-cover"
        priority
      />
    </div>
  );
}
