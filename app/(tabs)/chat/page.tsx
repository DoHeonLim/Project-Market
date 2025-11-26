/**
 * File Name : app/(tabs)/chat/page
 * Description : 채팅 페이지
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2024.10.14  임도헌   Created
 * 2024.10.14  임도헌   Modified  채팅 페이지 추가
 * 2024.11.15  임도헌   Modified  채팅방 캐싱 추가
 * 2024.12.05  임도헌   Modified  스타일 변경
 * 2025.07.24  임도헌   Modified  캐싱 기능 추가
 * 2025.11.21  임도헌   Modified  nextCache 제거, dynamic 페이지로 고정
 */

import getSession from "@/lib/session";
import { getChatRooms } from "@/lib/chat/room/getChatRooms";
import ChatRoomListContainer from "@/components/chat/ChatRoomListContainer";

export const dynamic = "force-dynamic"; // 명시적으로 동적 페이지 선언

export default async function Chat() {
  const session = await getSession();
  const chatRooms = await getChatRooms(session.id!);

  return (
    <ChatRoomListContainer initialRooms={chatRooms} userId={session.id!} />
  );
}
