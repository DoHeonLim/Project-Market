/**
 * File Name : types/chat
 * Description : 채팅 관련 타입 정의
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2025.07.13  임도헌   Created   채팅 타입 분리
 * 2025.08.01  임도헌   Modified  스트리밍 채팅 메시지 타입 정의
 * 2025.11.21  임도헌   Modified  채팅방 unreadCount 필드 및 읽음 이벤트 payload 타입 정리
 */

// 채팅 유저 정보 타입
export interface ChatUser {
  id: number;
  username: string;
  avatar?: string | null;
}

// 개별 채팅 메시지 타입
export interface ChatMessage {
  id: number;
  payload: string;
  created_at: Date;
  isRead: boolean;
  user: ChatUser;
  // 제품 채팅방 ID (productMessage.productChatRoomId)
  productChatRoomId: string;
}

// 채팅방에 연결된 제품 정보 타입
export interface ChatProduct {
  id: number;
  title: string;
  imageUrl: string;
}

// 채팅방 정보 타입
export interface ChatRoom {
  id: string;
  created_at: Date;
  updated_at: Date;
  product: ChatProduct;
  users: ChatUser[];
  lastMessage: ChatMessage | null;

  /**
   * 서버에서 계산해서 주입하는 "읽지 않은 메시지 수"
   * - 채팅방 리스트(getChatRooms)에서는 항상 설정됨
   * - 다른 컨텍스트에서 ChatRoom을 사용할 수 있으므로 optional
   */
  unreadCount?: number;
}

// 채팅방과 메시지 목록을 함께 포함한 타입
export interface ChatRoomWithMessages extends ChatRoom {
  messages: ChatMessage[];
}

/**
 * Supabase 메시지 읽음 이벤트 payload 타입
 * - room-${chatRoomId} 채널로 broadcast할 때 사용
 * - payload: { readIds: number[] }
 */
export interface MessageReadPayload {
  readIds: number[];
}

/**
 * 스트리밍 채팅 메시지 타입
 */
export interface StreamChatMessage {
  id: number;
  payload: string;
  created_at: Date;
  userId: number;
  user: {
    username: string;
    avatar: string | null;
  };
  streamChatRoomId: number;
}
