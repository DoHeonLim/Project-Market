/**
 * File Name : components/stream/recording/recordingDetail/RecordingTitle
 * Description : 스트리밍 녹화 상세 - 제목 표시
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2025.08.06  임도헌   Created   스트리밍 녹화 상세 상단 헤더 분리
 * 2025.11.26  임도헌   Modified  작성자 정보는 Topbar로 이동, 제목 전용 컴포넌트로 축소
 */

"use client";

interface RecordingTitleProps {
  title: string;
}

export default function RecordingTitle({ title }: RecordingTitleProps) {
  return (
    <div className="px-4">
      <h2 className="text-xl font-bold text-neutral-900 dark:text-white line-clamp-2 break-all">
        {title}
      </h2>
    </div>
  );
}
