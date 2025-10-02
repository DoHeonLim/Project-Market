/**
 * File Name : types/chat
 * Description : 채팅 관련 타입 정의
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2025.07.13  임도헌   Created   채팅 타입 분리
 * 2025.08.01  임도헌   Modified  스트리밍 채팅 메시지 타입 정의
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
  productChatRoomId: string | null;
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
}

// 채팅방과 메시지 목록을 함께 포함한 타입
export interface ChatRoomWithMessages extends ChatRoom {
  messages: ChatMessage[];
}

// Supabase 메시지 읽음 이벤트 payload 타입
export interface MessageReadPayload {
  userId: number;
  roomId: string;
  readAt: string;
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
