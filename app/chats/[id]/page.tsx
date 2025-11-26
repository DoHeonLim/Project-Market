/**
 * File Name : app/chats/[id]/page
 * Description : 제품 채팅 페이지
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2024.11.08  임도헌   Created
 * 2024.11.08  임도헌   Modified  제품 채팅 페이지 추가
 * 2024.11.15  임도헌   Modified  prisma 코드 actions으로 옮김
 * 2024.11.21  임도헌   Modified  Chatroom을 productChatRoom으로 변경
 * 2024.12.12  임도헌   Modified  뒤로가기 버튼 추가
 * 2024.12.22  임도헌   Modified  채팅방에 어떤 제품인지 추가
 * 2025.05.01  임도헌   Modified  뒤로가기 버튼 삭제
 * 2025.07.13  임도헌   Modified  함수명 변경 및 비즈니스 로직 분리
 * 2025.07.17  임도헌   Modified  메시지 무한 스크롤 구현
 * 2025.07.24  임도헌   Modified  캐싱 기능 추가
 * 2025.11.21  임도헌   Modified  메시지 초기 로딩 캐싱 제거
 */

import ChatMessagesList from "@/components/chat/ChatMessagesList";
import { notFound } from "next/navigation";
import { getUserInfo } from "@/lib/user/getUserInfo";
import { getChatRoomDetails } from "@/lib/chat/room/getChatRoomDetails";
import {
  getInitialMessagesAction,
  readMessageUpdateAction,
} from "./actions/messages";
import ChatHeader from "@/components/chat/ChatHeader";
import { checkChatRoomAccessAction } from "./actions/room";

export default async function ChatRoom({ params }: { params: { id: string } }) {
  const chatRoomId = params.id;
  // 유저 정보
  const user = await getUserInfo();
  if (!user) return notFound();

  // 현재 채팅방 정보
  const room = await checkChatRoomAccessAction(chatRoomId, user.id);
  if (!room) return notFound();

  // 제품 정보
  const product = await getChatRoomDetails(room.productId);
  if (!product) return notFound();

  // 메세지 초깃값
  const initialMessages = await getInitialMessagesAction(chatRoomId, 20);

  const productUser = await getUserInfo(product.userId);
  if (!productUser) return notFound();

  // 채팅 방에 들어가면 메시지 읽음 표시로 업데이트
  await readMessageUpdateAction(chatRoomId, user.id);

  return (
    <>
      <ChatHeader product={product} user={productUser} />
      <ChatMessagesList
        productChatRoomId={chatRoomId}
        user={user}
        initialMessages={initialMessages}
      />
    </>
  );
}
