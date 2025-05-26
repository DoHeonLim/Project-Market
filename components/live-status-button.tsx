/**
File Name : components/live-status-button
Description : 라이브 상태 버튼
Author : 임도헌

History
Date        Author   Status    Description
2024.11.19  임도헌   Created
2024.11.19  임도헌   Modified  라이브 상태 버튼
2025.05.16  임도헌   Modified  주기적인 업데이트로 변경
*/
"use client";
import { useEffect, useState } from "react";
import { updateStreamStatus } from "@/app/streams/[id]/actions";

export default function LiveStatusButton({
  status,
  streamId,
}: {
  status: string;
  streamId: string;
}) {
  const [isLived, setIsLived] = useState<string>(status);

  useEffect(() => {
    console.log("status", status);
    // 주기적으로 상태 업데이트
    const interval = setInterval(async () => {
      const result = await updateStreamStatus(streamId);
      if (result.success) {
        setIsLived(result.status?.toUpperCase() ?? status);
      }
    }, 5000); // 5초마다 상태 확인

    // 컴포넌트 언마운트 시 인터벌 정리
    return () => clearInterval(interval);
  }, [streamId, status]);

  return (
    <>
      {isLived === "CONNECTED" ? (
        <div className="flex items-center justify-center w-20 h-8 mb-4 bg-indigo-500 rounded-md">
          <span className="text-sm font-semibold">방송 중</span>
        </div>
      ) : (
        <div className="flex items-center justify-center w-20 h-8 mb-4 bg-red-500 rounded-md">
          <span className="text-sm font-semibold animate-pulse">방송 종료</span>
        </div>
      )}
    </>
  );
}
