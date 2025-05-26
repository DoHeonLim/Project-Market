/**
File Name : components/stream-detail
Description : 스트리밍 상세 컴포넌트
Author : 임도헌

History
Date        Author   Status    Description
2024.11.19  임도헌   Created
2024.11.19  임도헌   Modified  스트리밍 상세 컴포넌트 추가
2024.11.21  임도헌   Modified  Link를 streams/[id]/page에서 StreamDetail로 옮김
2024.11.21  임도헌   Modified  스트리밍 하기 위한 정보들 본인만 보이게 변경
2024.12.07  임도헌   Modified  프로필 이미지 컴포넌트 분리
2025.05.16  임도헌   Modified  UI 변경, 실시간 시청자 수 기능 추가
*/
"use client";

import LiveStatusButton from "./live-status-button";
import StreamDeleteButton from "./stream-delete-button";
import { deleteStream } from "@/app/streams/[id]/actions";
import Link from "next/link";
import UserAvatar from "./user-avatar";
import { useState } from "react";
import {
  EyeIcon,
  EyeSlashIcon,
  ClipboardIcon,
} from "@heroicons/react/24/outline";
import LiveViewerCount from "./live-viewer-count";
import TimeAgo from "./time-ago";

interface IStreamDetail {
  stream: {
    title: string;
    stream_key: string;
    stream_id: string;
    userId: number;
    user: {
      username: string;
      avatar: string | null;
    };
    category?: {
      eng_name: string;
      kor_name: string;
      icon: string | null;
    };
    tags?: {
      name: string;
    }[];
    viewer_count?: number;
    started_at?: Date | null;
    description?: string | null;
    status: string;
  };
  me: number;
  streamId: number;
}

export default function StreamDetail({ stream, me, streamId }: IStreamDetail) {
  const [showSecret, setShowSecret] = useState(false);
  const [expanded, setExpanded] = useState(false);

  // 시크릿키 복사 함수
  const copySecret = () => {
    navigator.clipboard.writeText(stream.stream_key);
    alert("시크릿 키가 복사되었습니다!");
  };

  if (!stream) return <div>존재하지 않는 방송입니다.</div>;

  return (
    <div className="relative">
      {/* 시청자 수 박스 */}
      <div className="absolute top-3 right-3 z-10">
        <LiveViewerCount streamId={streamId} me={me} />
      </div>
      <LiveStatusButton status={stream.status} streamId={stream.stream_id} />
      <div className="relative aspect-video rounded-xl overflow-hidden mb-4 bg-black">
        {stream.status === "ENDED" ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-white">
            <p className="text-xl font-semibold mb-4">방송이 종료되었습니다</p>
            <Link
              href={`/profile/${stream.user.username}/streams`}
              className="px-4 py-2 bg-indigo-500 rounded-md hover:bg-indigo-600 transition-colors"
            >
              다시보기 목록으로 이동
            </Link>
          </div>
        ) : (
          <iframe
            src={`${process.env.NEXT_PUBLIC_CLOUDFLARE_STREAM_DOMAIN}/${stream.stream_id}/iframe`}
            className="w-full h-full"
            allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
            allowFullScreen
          ></iframe>
        )}
      </div>
      <div className="flex gap-4 text-xs text-gray-400">
        {stream.started_at && (
          <span>
            시작: <TimeAgo date={stream.started_at.toString()} />
          </span>
        )}
      </div>
      <div className="flex items-center gap-3 mb-2">
        <UserAvatar
          avatar={stream.user.avatar}
          username={stream.user.username}
        />

        <div className="flex flex-wrap font-bold text-xs sm:text-sm md:text-base lg:text-lg dark:text-white ">
          {stream.title}
        </div>
      </div>
      <div className="ml-2 mb-2 text-sm text-neutral-800 dark:text-white">
        {expanded ? stream.description : stream.description?.slice(0, 80)}
        {stream.description && stream.description.length > 80 && !expanded && (
          <span>...</span>
        )}
        {stream.description && stream.description.length > 80 && (
          <button
            className="ml-2 text-blue-500 hover:underline"
            onClick={() => setExpanded((v) => !v)}
          >
            {expanded ? "접기" : "더보기"}
          </button>
        )}
      </div>
      <div className="flex items-center gap-2 flex-wrap mb-2">
        <div className=" text-xs text-white bg-primary dark:bg-primary-light rounded-md px-2 py-1">
          {`${stream.category?.icon} ${stream.category?.kor_name}`}
        </div>
        {stream.tags?.map((tag) => (
          <span
            key={tag.name}
            className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs"
          >
            #{tag.name}
          </span>
        ))}
      </div>

      {stream.userId === me && (
        <div className="mb-4">
          <button
            onClick={() => setShowSecret((v) => !v)}
            className="flex text-xs sm:text-sm md:text-base lg:text-lg items-center gap-1 px-3 py-1 bg-yellow-200 text-yellow-900 rounded font-semibold mb-2 hover:bg-yellow-300 transition"
          >
            {showSecret ? (
              <>
                <EyeSlashIcon className="w-5 h-5" />
                스트리밍 정보 숨기기
              </>
            ) : (
              <>
                <EyeIcon className="w-5 h-5" />
                스트리밍 정보 보기
              </>
            )}
          </button>
          {showSecret && (
            <div className="p-4 bg-yellow-100 rounded-lg text-sm text-black space-y-2">
              <div>
                <span className="font-bold">스트리밍 URL:</span>
                <span className="ml-2">
                  rtmps://live.cloudflare.com:443/live/
                </span>
              </div>
              <div className="flex items-center">
                <span className="font-bold">Secret Key:</span>
                <span className="ml-2 break-all">{stream.stream_key}</span>
                <button
                  onClick={copySecret}
                  className="ml-2 p-1 rounded hover:bg-yellow-200"
                  title="복사"
                >
                  <ClipboardIcon className="w-5 h-5" />
                </button>
              </div>
              <div className="text-xs text-gray-600 mt-1">
                * 이 정보는 방송 소유자에게만 보입니다.
              </div>
            </div>
          )}
        </div>
      )}
      {stream.userId !== me ? null : (
        <StreamDeleteButton
          streamId={stream.stream_id}
          id={streamId}
          status={stream.status}
          onDelete={deleteStream}
        />
      )}
    </div>
  );
}
