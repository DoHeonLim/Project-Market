/**
 * File Name : components/stream/recordingComment/RecordingComment
 * Description : 스트리밍 녹화본 댓글 섹션 Wrapper 컴포넌트 (VodAsset 단위)
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2025.08.05  임도헌   Created   Provider 포함 전체 댓글 UI 통합 컴포넌트 구성
 * 2025.09.20  임도헌   Modified  VodAsset 전환(streamId → vodId), import 경로 정리
 */

"use client";

import RecordingCommentProvider from "@/components/providers/RecordingCommentProvider";
import RecordingCommentForm from "@/components/stream/recording/recordingComment/RecordingCommentForm";
import RecordingCommentList from "@/components/stream/recording/recordingComment/RecordingCommentList";

interface RecordingCommentProps {
  /** 댓글 대상 VodAsset.id */
  vodId: number;
  currentUserId: number;
}

export default function RecordingComment({
  vodId,
  currentUserId,
}: RecordingCommentProps) {
  return (
    <RecordingCommentProvider vodId={vodId}>
      <div className="mt-6 px-4 w-full max-w-3xl">
        <h3 className="text-lg font-semibold mb-4 text-black dark:text-white">
          댓글
        </h3>
        <RecordingCommentForm vodId={vodId} />
        <RecordingCommentList currentUserId={currentUserId} />
      </div>
    </RecordingCommentProvider>
  );
}
