/**
File Name : components/live-status-button
Description : 라이브 상태 버튼
Author : 임도헌

History
Date        Author   Status    Description
2024.11.19  임도헌   Created
2024.11.19  임도헌   Modified  라이브 상태 버튼
*/
"use client";
import { useEffect, useState } from "react";
export default function LiveStatusButton({ status }: { status: any }) {
  const [isLived, setIsLived] = useState("disconnected");
  useEffect(() => {
    if (
      status.result.status === null ||
      status.result.status.current?.state === "disconnected"
    ) {
      setIsLived("disconnected");
    } else {
      setIsLived("connected");
    }
  }, [status]);
  return (
    <>
      {isLived === "connected" ? (
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
