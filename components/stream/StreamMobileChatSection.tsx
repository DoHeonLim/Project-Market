/**
 * File Name : components/stream/StreamMobileChatSection
 * Description : 스트리밍 모바일 채팅 섹션(확대 모드 지원)
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2025.11.17  임도헌   Created   모바일 채팅 섹션 기본 레이아웃
 * 2025.11.17  임도헌   Modified  채팅 확대/축소 모드 추가
 * 2025.11.17  임도헌   Modified  채팅 높이 계산
 * 2025.11.17  임도헌   Modified  레이아웃 이벤트 기반 높이 재계산
 */
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import StreamChatRoom from "@/components/stream/StreamChatRoom";
import type { StreamChatMessage } from "@/types/chat";

interface Props {
  initialStreamMessage: StreamChatMessage[];
  streamChatRoomId: number;
  streamChatRoomhost: number;
  userId: number;
  username: string;
}

export default function StreamMobileChatSection({
  initialStreamMessage,
  streamChatRoomId,
  streamChatRoomhost,
  userId,
  username,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [computedHeight, setComputedHeight] = useState<number | null>(null);

  /** 채팅 컨테이너의 화면상 top 기준으로, 뷰포트 하단까지의 높이 계산 */
  const updateHeight = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const vh = window.innerHeight;
    const h = Math.max(200, vh - rect.top); // 최소 200px 안전장치

    setComputedHeight(h);
  }, []);

  /** Topbar에서 채팅을 완전히 닫았을 때: 확대 상태 초기화 */
  useEffect(() => {
    const handleState = (event: Event) => {
      const { detail } = event as CustomEvent<{ open?: boolean }>;
      if (detail?.open === false) {
        setExpanded(false);
        // 닫힐 때도 현재 위치 기준 높이 한 번 정리
        updateHeight();
      }
    };

    window.addEventListener("stream:chat:state", handleState as EventListener);
    return () => {
      window.removeEventListener(
        "stream:chat:state",
        handleState as EventListener
      );
    };
  }, [updateHeight]);

  /** 헤더에서 눌리는 확대/축소 버튼 – 여기서는 expanded만 토글 */
  const toggleExpand = () => {
    setExpanded((prev) => !prev);
  };

  /** 최초 마운트/리사이즈/회전 시 높이 계산 */
  useEffect(() => {
    updateHeight();
    window.addEventListener("resize", updateHeight);
    window.addEventListener("orientationchange", updateHeight);
    return () => {
      window.removeEventListener("resize", updateHeight);
      window.removeEventListener("orientationchange", updateHeight);
    };
  }, [updateHeight]);

  /**
   * expanded 값이 바뀌면:
   * 1) StreamDetail에게 "채팅 확대/축소" 상태를 알려줌
   *    → StreamDetail이 hiddenByChat을 바꾸고, 레이아웃이 확정되면
   *    → "stream:chat:layout-updated" 이벤트를 보내줌
   * 2) 우리는 그 "layout-updated" 이벤트를 듣고 높이를 재계산
   */
  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("stream:chat:expand", { detail: { expanded } })
    );
  }, [expanded]);

  /** StreamDetail에서 레이아웃이 실제로 바뀐 뒤에 오는 신호 */
  useEffect(() => {
    const handleLayoutUpdated = () => {
      updateHeight();
    };

    window.addEventListener(
      "stream:chat:layout-updated",
      handleLayoutUpdated as EventListener
    );
    return () => {
      window.removeEventListener(
        "stream:chat:layout-updated",
        handleLayoutUpdated as EventListener
      );
    };
  }, [updateHeight]);

  return (
    <div
      ref={containerRef}
      style={
        computedHeight != null
          ? { height: computedHeight, maxHeight: computedHeight }
          : undefined
      }
      className="flex flex-col overflow-hidden"
    >
      <div className="flex-1 min-h-0">
        <StreamChatRoom
          initialStreamMessage={initialStreamMessage}
          streamChatRoomId={streamChatRoomId}
          streamChatRoomhost={streamChatRoomhost}
          userId={userId}
          username={username}
          fillParent
          showExpandToggle
          isExpanded={expanded}
          onToggleExpand={toggleExpand}
        />
      </div>
    </div>
  );
}
