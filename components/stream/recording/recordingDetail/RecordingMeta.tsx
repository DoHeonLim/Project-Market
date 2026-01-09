/**
 * File Name : components/stream/recordingDetail/RecordingMeta
 * Description : 스트리밍 녹화 상세 - 날짜, 길이, 좋아요, 조회수, 댓글, 공유 정보
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2025.08.06  임도헌   Created   녹화 상세 메타 정보 표시 컴포넌트 생성
 * 2025.09.10  임도헌   Modified  TimeAgo에 Date 직접 전달, 공유 핸들러 보강, a11y/가독성 개선
 */

"use client";

import TimeAgo from "@/components/common/TimeAgo";
import { formatDuration } from "@/lib/utils";
import {
  ChatBubbleBottomCenterTextIcon,
  EyeIcon,
  ShareIcon,
} from "@heroicons/react/24/solid";
import { toast } from "sonner";

interface RecordingMetaProps {
  created: Date;
  duration: number;
  viewCount?: number;
  commentCount?: number;
  LikeButtonComponent?: React.ReactNode;
}

export default function RecordingMeta({
  created,
  duration,
  viewCount = 0,
  commentCount = 0,
  LikeButtonComponent,
}: RecordingMetaProps) {
  const handleCopyLink = async () => {
    try {
      const url = typeof window !== "undefined" ? window.location.href : "";

      // 1) Web Share API 우선
      if (url && typeof navigator !== "undefined" && "share" in navigator) {
        await (navigator as any).share({ title: document.title, url });
        return;
      }

      // 2) Clipboard API
      if (url && typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        toast.success("링크가 복사되었습니다.");
        return;
      }

      // 3) 폴백
      toast.error("공유를 지원하지 않는 환경입니다.");
    } catch {
      toast.error("링크 복사에 실패했습니다. 다시 시도해주세요.");
    }
  };

  return (
    <div className="flex items-center justify-between px-2 text-sm text-neutral-600 dark:text-neutral-300">
      {/* 왼쪽: 생성일 + 영상 길이 */}
      <div>
        <TimeAgo date={created} /> • {formatDuration(duration)}
      </div>

      {/* 오른쪽: 좋아요/조회수/댓글/공유 */}
      <div className="flex items-center gap-4">
        {LikeButtonComponent}

        <span className="flex items-center gap-1">
          <EyeIcon className="size-6" aria-hidden="true" />
          {viewCount.toLocaleString()}
        </span>

        <span className="flex items-center gap-1">
          <ChatBubbleBottomCenterTextIcon
            className="size-6"
            aria-hidden="true"
          />
          {commentCount.toLocaleString()}
        </span>

        <button
          type="button"
          onClick={handleCopyLink}
          className="flex items-center gap-1 hover:text-neutral-900 dark:hover:text-white transition-colors"
          aria-label="링크 공유"
          title="링크 공유"
        >
          <ShareIcon className="size-6" aria-hidden="true" />
          공유
        </button>
      </div>
    </div>
  );
}
