/**
 * File Name : components/stream/streamDetail/index
 * Description : 스트리밍 상세 메인 컴포넌트 (세부 UI 모듈화 포함)
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2024.11.19  임도헌   Created
 * 2024.11.19  임도헌   Modified  스트리밍 상세 컴포넌트 추가
 * 2024.11.21  임도헌   Modified  Link를 streams/[id]/page에서 StreamDetail로 옮김
 * 2024.11.21  임도헌   Modified  스트리밍 하기 위한 정보들 본인만 보이게 변경
 * 2024.12.07  임도헌   Modified  프로필 이미지 컴포넌트 분리
 * 2025.05.16  임도헌   Modified  UI 변경, 실시간 시청자 수 기능 추가
 * 2025.07.31  임도헌   Modified  분리된 세부 컴포넌트 통합 구성
 * 2025.08.23  임도헌   Modified  Cloudflare 플레이어 ENV 가드 추가, ENDED 오버레이 조건 명시
 * 2025.09.09  임도헌   Modified  ENV 변수 재사용 버그 수정, started_at 직렬화 가드, 중복 비교 정리
 * 2025.09.13  임도헌   Modified  iframe 자동재생 추가
 * 2025.09.15  임도헌   Modified  레이아웃 재배치: 제목→메타(시작시간+태그 한줄)→유저
 * 2025.09.16  임도헌   Modified  Broadcast 스키마 정렬(stream_id/stream_key optional)
 * 2025.09.17  임도헌   Modified  삭제 버튼을 녹화 페이지로 이동 (상세에서는 노출하지 않음)
 * 2025.11.16  임도헌   Modified  모든 정보 블록을 하나의 아코디언으로 접기/펼치기(모바일 기본 접힘)
 */

"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import LiveStatusButton from "@/components/stream/StreamDetail/LiveStatusButton";
import TimeAgo from "@/components/common/TimeAgo";
import StreamEndedOverlay from "@/components/stream/StreamDetail/StreamEndedOverlay";
import StreamCategoryTags from "@/components/stream/StreamDetail/StreamCategoryTags";
import StreamDescription from "@/components/stream/StreamDetail/StreamDescription";
import StreamSecretInfo from "@/components/stream/StreamDetail/StreamSecretInfo";
import LiveViewerCount from "@/components/stream/StreamDetail/LiveViewerCount";
import StreamTitle from "@/components/stream/StreamDetail/StreamTitle";
import UserAvatar from "@/components/common/UserAvatar";
import type { StreamDetailDTO } from "@/lib/stream/getBroadcastDetail";
import { ChevronDownIcon } from "@heroicons/react/24/solid";

interface StreamDetailProps {
  stream: StreamDetailDTO;
  /** 현재 로그인 유저 id */
  me: number | null;
  /** Broadcast id */
  streamId: number;
}

export default function StreamDetail({
  stream,
  me,
  streamId,
}: StreamDetailProps) {
  const isOwner = !!me && stream.user.id === me;

  // 모바일 기본 접힘, 데스크톱 기본 펼침
  const [opened, setOpened] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia("(min-width: 1280px)");
    const apply = () => setOpened(mql.matches);
    apply();
    mql.addEventListener?.("change", apply);
    return () => mql.removeEventListener?.("change", apply);
  }, []);

  // 채팅 확대 모드일 때 모바일에서 방송 정보 숨기기
  const [hiddenByChat, setHiddenByChat] = useState(false);
  useEffect(() => {
    const onChatExpand = (event: Event) => {
      const { detail } = event as CustomEvent<{ expanded?: boolean }>;
      if (typeof detail?.expanded === "boolean") {
        setHiddenByChat(detail.expanded);
      }
    };
    window.addEventListener(
      "stream:chat:expand",
      onChatExpand as EventListener
    );
    return () => {
      window.removeEventListener(
        "stream:chat:expand",
        onChatExpand as EventListener
      );
    };
  }, []);

  // hiddenByChat 값이 바뀔 때마다, 레이아웃이 다시 잡힌 후라고 간주하고 신호를 보냄
  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("stream:chat:layout-updated", {
        detail: { hiddenByChat },
      })
    );
  }, [hiddenByChat]);

  return (
    <div className="relative">
      {/* 우상단 실시간 시청자 수 */}
      <div className="absolute top-2 right-2 z-10">
        {me != null && <LiveViewerCount streamId={streamId} me={me} />}
      </div>

      {/* 라이브 상태 라벨 */}
      <LiveStatusButton status={stream.status} streamId={stream.stream_id} />

      {/* 플레이어 */}
      <div className="relative mb-1 aspect-video overflow-hidden bg-black">
        {(() => {
          const DOMAIN = process.env.NEXT_PUBLIC_CLOUDFLARE_STREAM_DOMAIN;
          if (!DOMAIN) {
            return (
              <div className="absolute inset-0 flex items-center justify-center px-4 text-center text-sm text-red-300">
                환경변수 <code>NEXT_PUBLIC_CLOUDFLARE_STREAM_DOMAIN</code>가
                설정되지 않았습니다.
              </div>
            );
          }
          const params = new URLSearchParams({
            autoplay: "1",
            muted: "1",
            preload: "auto",
          });
          const src = `${DOMAIN}/${stream.stream_id}/iframe?${params.toString()}`;
          return (
            <iframe
              title={`Live stream player • ${stream.title ?? stream.stream_id}`}
              className="absolute inset-0 h-full w-full"
              src={src}
              allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
              loading="lazy"
              allowFullScreen
            />
          );
        })()}
        {stream.status === "ENDED" && (
          <StreamEndedOverlay username={stream.user.username} />
        )}
      </div>

      {/* ===== 전체 정보 단일 접힘 패널 ===== */}
      <section
        className={clsx(
          "mb-1 overflow-hidden rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900",
          // 채팅 확대 모드일 때: 모바일/태블릿(<xl)에서는 숨기고,
          // 데스크톱(≥xl)에서는 항상 보이게 유지
          hiddenByChat && "hidden xl:block"
        )}
      >
        {/* 토글 헤더 */}
        <button
          type="button"
          className="flex w-full items-center justify-between px-3 py-2 text-left"
          aria-expanded={opened}
          onClick={() => setOpened((v) => !v)}
        >
          <span className="text-sm md:text-base font-semibold text-neutral-900 dark:text-neutral-100">
            방송 정보
          </span>
          <div className="flex items-center gap-3">
            {/* 열림/닫힘 상태 힌트 */}
            <span className="text-xs text-neutral-500 dark:text-neutral-400">
              {opened ? "접기" : "펼치기"}
            </span>
            <ChevronDownIcon
              className={`h-4 w-4 text-neutral-500 transition-transform ${
                opened ? "rotate-180" : ""
              }`}
              aria-hidden="true"
            />
          </div>
        </button>

        {/* 본문(제목/메타/유저/설명/소유자 정보) */}
        <div
          className={`grid transition-[grid-template-rows,opacity] duration-200 ease-out ${
            opened ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
          }`}
        >
          <div className="min-h-0 overflow-hidden px-4 pb-4">
            {/* 제목 */}
            <div className="pt-1">
              <StreamTitle title={stream.title} />
            </div>

            {/* 메타(카테고리/태그/시작 시간) */}
            <div
              className="
                mb-3 mt-2 flex flex-wrap items-center gap-2 text-xs
                text-neutral-600 dark:text-neutral-300 [&>div]:mb-0 [&>div]:inline-flex
              "
            >
              <StreamCategoryTags
                category={stream.category ?? undefined}
                tags={stream.tags ?? undefined}
              />
              {stream.started_at && (
                <span>
                  시작: <TimeAgo date={stream.started_at} />
                </span>
              )}
            </div>

            {/* 유저(아바타/이름) */}
            <div className="mb-3 flex items-center gap-3">
              <UserAvatar
                avatar={stream.user.avatar}
                username={stream.user.username}
              />
            </div>

            {/* 설명 */}
            {stream.description && (
              <div className="mt-1">
                <StreamDescription description={stream.description} />
              </div>
            )}

            {/* 소유자 전용 도구 */}
            {isOwner && (
              <div className="mt-3">
                <StreamSecretInfo broadcastId={streamId} />
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
