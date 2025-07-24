/**
 * File Name : hooks/useInfiniteMessages
 * Description : 채팅방 무한스크롤 메시지 훅
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2025.07.15  임도헌   Created   무한스크롤 메시지 관리
 * 2025.07.22  임도헌   Modified  단계별 주석 추가 및 코드 흐름 설명 강화
 */

"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { ChatMessage } from "@/types/chat";
import { getMoreMessagesAction } from "@/app/chats/[id]/actions/messages";

/**
 * useInfiniteMessages
 * - 초기 메시지를 기반으로 상태 관리
 * - IntersectionObserver를 활용한 상단 무한스크롤 구현
 * - 메시지 추가, 교체, 스크롤 위치 유지 등의 기능 포함
 *
 * initialMessages - 최초 서버사이드로 전달된 메시지 목록
 * chatRoomId - 채팅방 고유 ID (더 불러오기용)
 */
export default function useInfiniteMessages(
  initialMessages: ChatMessage[],
  chatRoomId: string
) {
  /** 상태 정의 */
  const [messages, setMessages] = useState(initialMessages); // 전체 메시지 리스트
  const [isFetching, setIsFetching] = useState(false); // 로딩 상태
  const [hasMore, setHasMore] = useState(true); // 더 불러올 메시지가 있는지 여부

  /** DOM 참조 */
  const containerRef = useRef<HTMLDivElement>(null); // 전체 스크롤 영역
  const sentinelRef = useRef<HTMLDivElement>(null); // 무한스크롤 트리거 요소
  const messagesEndRef = useRef<HTMLDivElement>(null); // 스크롤 최하단 위치

  /**
   * 과거 메시지 불러오기
   * - 가장 오래된 메시지를 기준으로 추가 fetch
   * - 결과가 없으면 hasMore를 false로 변경
   * - 스크롤 위치 유지 위해 offset 보정
   */
  const fetchMore = useCallback(async () => {
    if (isFetching || !hasMore) return;
    setIsFetching(true);

    const firstMessageId = messages[0]?.id;
    const result = await getMoreMessagesAction(chatRoomId, firstMessageId);

    if (!result.success) {
      console.error("메시지 로딩 실패:", result.error);
      setIsFetching(false);
      return;
    }

    if (result.data?.length === 0) {
      setHasMore(false);
    } else {
      setMessages((prev) => [...(result.data ?? []), ...prev]);

      // fetch 이후 스크롤 위치 유지 보정
      requestAnimationFrame(() => {
        containerRef.current!.scrollTop += 100;
      });
    }

    setIsFetching(false);
  }, [isFetching, hasMore, messages, chatRoomId]);

  /**
   * IntersectionObserver로 무한스크롤 감지
   * - sentinelRef가 viewport에 보이면 fetchMore 호출
   */
  useEffect(() => {
    if (!sentinelRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isFetching) {
          fetchMore();
        }
      },
      {
        threshold: 1,
        rootMargin: "0px 100px", // 약간의 여유를 두고 감지
      }
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [fetchMore, isFetching]);

  /**
   * 실시간 또는 낙관적 메시지 추가
   */
  const appendMessage = (newMessage: ChatMessage) => {
    setMessages((prev) => [...prev, newMessage]);
  };

  /** 외부로 반환되는 값들 */
  return {
    messages,
    isFetching,
    appendMessage,
    setMessages,
    containerRef,
    sentinelRef,
    messagesEndRef,
  };
}
