/**
 File Name : components/chat/Chatbutton
 Description : 채팅 버튼 컴포넌트
 Author : 임도헌
 
 History
 Date        Author   Status    Description
 2024.12.19  임도헌   Created
 2024.12.19  임도헌   Modified  채팅 버튼 컴포넌트 추가

 */
"use client";

import { createChatRoom } from "@/app/products/[id]/actions";

export default function ChatButton({ id }: { id: number }) {
  return (
    <form action={() => createChatRoom(id)}>
      <button className="px-5 py-2.5 font-medium text-white bg-primary hover:bg-primary/90 rounded-md transition-colors">
        채팅하기
      </button>
    </form>
  );
}
