/**
 * File Name : components/chat/ChatMessageList
 * Description : 채팅 메시지 컴포넌트
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2024.11.01  임도헌   Created
 * 2024.11.08  임도헌   Modified  채팅 메시지 컴포넌트 추가
 * 2024.11.09  임도헌   Modified  supabase 채널 연결 및 실시간 채팅 기능 추가
 * 2024.11.15  임도헌   Modified  채팅 읽음 안읽음 추가
 * 2024.11.21  임도헌   Modified  ChatroomId를 productChatRoomId으로 변경
 * 2024.12.07  임도헌   Modified  프로필 이미지 컴포넌트 분리
 * 2024.12.08  임도헌   Modified  시간 표시 컴포넌트 분리
 * 2024.12.12  임도헌   Modified  스타일 변경
 * 2024.12.19  임도헌   Modified  supabase 클라이언트 코드 lib로 이동
 * 2024.12.22  임도헌   Modified  메시지 저장 코드 변경(실시간 통신)
 * 2024.12.30  임도헌   Modified  스크롤 버그 수정
 * 2025.02.02  임도헌   Modified  신속한 교신병 뱃지 체크 추가(checkQuickResponseBadge)
 * 2025.04.18  임도헌   Modified  checkQuickResponseBadge를 server action으로 변경하고 불러오게 변경
 * 2025.05.10  임도헌   Modified  UI 개선
 * 2025.07.14  임도헌   Modified  BoardPort 컨셉 최종 디자인 적용
 * 2025.07.17  임도헌   Modified  채팅 무한 스크롤 구현
 * 2025.07.22  임도헌   Modified  ChatInputBar 입력 상태 관리 통합, 코드 심플화 및 스크롤 위치 유지 최적화
 * 2025.07.24  임도헌   Modified  useInfiniteMessages 적용(훅으로 분리)
 * 2025.07.29  임도헌   Modified  낙관적 업데이트(메시지) 제거
 */

"use client";

import { useEffect, useRef } from "react";
import ChatMessageBubble from "./ChatMessageBubble";
import ChatInputBar from "./ChatInputBar";
import useChatSubscription from "@/hooks/useChatSubscription";
import { ChatUser, ChatMessage } from "@/types/chat";
import { checkQuickResponseBadgeAction } from "@/app/chats/[id]/actions/badge";
import { sendMessageAction } from "@/app/chats/[id]/actions/messages";
import useInfiniteMessages from "@/hooks/useInfiniteMessages";

interface ChatMessagesListProps {
  initialMessages: ChatMessage[];
  productChatRoomId: string;
  user: ChatUser;
}

/**
 * ChatMessagesList
 * - 채팅방 메시지 리스트 + 입력창 UI
 * - 무한 스크롤, 실시간 메시지 구독, 메시지 전송 기능 포함
 */
export default function ChatMessagesList({
  initialMessages,
  user,
  productChatRoomId,
}: ChatMessagesListProps) {
  /**
   * 1단계: 무한 스크롤 훅 사용
   * - 이전 메시지 로드, DOM 참조 등 처리
   */
  const {
    messages,
    isFetching,
    setMessages,
    containerRef,
    sentinelRef,
    messagesEndRef,
  } = useInfiniteMessages(initialMessages, productChatRoomId);

  /**
   * 2단계: Supabase 실시간 구독
   * - 새로운 메시지 수신 시 리스트 추가 + 스크롤 이동
   * - 읽음 처리 이벤트 수신 시 isRead 상태 업데이트
   */
  useChatSubscription({
    chatRoomId: productChatRoomId,
    currentUserId: user.id,
    onNewMessage: (newMessage) => {
      setMessages((prev) => [...prev, newMessage]);
      // 메시지 수신 후 스크롤 하단으로 이동
      requestAnimationFrame(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      });
    },
    onMessagesRead: (readIds) => {
      setMessages((prev) =>
        prev.map((msg) =>
          readIds.includes(msg.id) ? { ...msg, isRead: true } : msg
        )
      );
    },
  });

  /**
   * 3단계: 최초 진입시 스크롤 하단으로 이동
   */
  const hasInitialScrolledRef = useRef(false);
  useEffect(() => {
    if (hasInitialScrolledRef.current) return;
    hasInitialScrolledRef.current = true;

    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
    });
  }, [messagesEndRef]);

  /**
   * 4단계: 메시지 전송 핸들러
   * - 뱃지 체크 호출
   * - 서버로 메시지 전송
   * - 전송 직후 두 프레임 후 스크롤 이동
   */
  const onSubmit = async (text: string) => {
    // 뱃지 처리
    checkQuickResponseBadgeAction(user.id);

    //  메시지 추가 후 → 두 프레임 뒤에 스크롤
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      });
    });

    try {
      await sendMessageAction(productChatRoomId, text);
    } catch (err) {
      console.error("메시지 전송 실패", err);
    }
  };

  /* 컴포넌트 렌더링 */
  return (
    <div
      ref={containerRef}
      className="flex flex-col h-screen bg-[url('/images/light-chat-bg.png')] dark:bg-[url('/images/dark-chat-bg.png')] bg-cover bg-center"
    >
      {/* 메시지 영역 */}
      <div className="flex-1 overflow-y-auto mt-10 p-4 space-y-2 scrollbar">
        <div ref={sentinelRef} />
        {isFetching && (
          <div className="text-center text-sm text-neutral-500">
            과거 메시지 불러오는 중...
          </div>
        )}
        {messages.map((message) => (
          <ChatMessageBubble
            key={message.id}
            message={message}
            isOwnMessage={message.user.id === user.id}
            showAvatar
            showTail
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* 입력 영역 */}
      <div className="mb-2">
        <ChatInputBar isSubmitting={isFetching} onSubmit={onSubmit} autoFocus />
      </div>
    </div>
  );
}
