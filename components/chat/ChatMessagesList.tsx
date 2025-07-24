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
 */

"use client";

import { useEffect } from "react";
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
  productUser: ChatUser;
  product: {
    id: number;
    title: string;
    images: { url: string }[];
    price: number;
    purchase_userId: number | null;
    reservation_userId: number | null;
  };
}

/**
 * ChatMessagesList
 * - 채팅 상세 화면의 메시지 UI 및 입력 바 구성
 * - 무한 스크롤 및 실시간 수신, 낙관적 메시지 처리 포함
 */
export default function ChatMessagesList({
  initialMessages,
  user,
  productChatRoomId,
}: ChatMessagesListProps) {
  /* 무한 스크롤 메시지 훅 */
  const {
    messages,
    isFetching,
    appendMessage,
    setMessages,
    containerRef,
    sentinelRef,
    messagesEndRef,
  } = useInfiniteMessages(initialMessages, productChatRoomId);

  /**
   * 실시간 메시지 구독
   * - 내가 보낸 optimistic 메시지와 동일하면 대체
   * - 이미 수신한 메시지라면 무시
   * - 마지막 메시지로 추가 후 스크롤 이동
   */
  useChatSubscription(
    productChatRoomId,
    (newMessage) => {
      setMessages((prev) => {
        const optimisticIndex = prev.findIndex(
          (msg) =>
            msg.id < 0 && // 음수 ID는 낙관적 메시지
            msg.payload === newMessage.payload &&
            msg.user.id === newMessage.user.id
        );

        // 낙관적 메시지를 대체
        if (optimisticIndex !== -1) {
          const updated = [...prev];
          updated[optimisticIndex] = {
            ...newMessage,
            id: prev[optimisticIndex].id,
          };
          return updated;
        }

        // 중복 메시지 방지
        if (prev.some((msg) => msg.id === newMessage.id)) {
          return prev;
        }

        return [...prev, newMessage];
      });

      // 마지막 메시지로 스크롤
      requestAnimationFrame(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      });
    },
    user.id
  );

  /* 최초 진입 시 맨 아래로 스크롤 */
  useEffect(() => {
    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
    });
  }, [messagesEndRef]);

  /**
   * 메시지 전송 핸들러
   * - 낙관적 메시지 먼저 추가
   * - 뱃지 체크
   * - 서버에 전송 후 실패 시 예외 처리
   */
  const onSubmit = async (text: string) => {
    const optimisticMessage: ChatMessage = {
      id: -Date.now(),
      payload: text,
      isRead: false,
      created_at: new Date(),
      user: { id: user.id, username: user.username },
      productChatRoomId,
    };

    appendMessage(optimisticMessage);
    checkQuickResponseBadgeAction(user.id);

    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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
      <div className="flex-1 overflow-y-auto mt-20 p-4 space-y-2 scrollbar">
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
