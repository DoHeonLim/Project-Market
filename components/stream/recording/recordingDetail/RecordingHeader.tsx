/**
 * File Name : components/stream/recording/recordingDetail/RecordingHeader
 * Description : 스트리밍 녹화 상세 - 작성자 정보 및 제목 표시
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2025.08.06  임도헌   Created   스트리밍 녹화 상세 상단 헤더 분리
 */

"use client";

import UserAvatar from "@/components/common/UserAvatar";

interface RecordingHeaderProps {
  user: {
    username: string;
    avatar: string | null;
  };
  title: string;
}

export default function RecordingHeader({ user, title }: RecordingHeaderProps) {
  return (
    <div className="flex flex-col gap-1 px-4">
      <div className="flex items-center gap-2">
        <UserAvatar avatar={user.avatar} username={user.username} size="md" />
        <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
          {title}
        </h2>
      </div>
    </div>
  );
}
