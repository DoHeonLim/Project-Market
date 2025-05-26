/**
File Name : components/live/StreamDeleteButton
Description : 스트리밍 삭제 버튼
Author : 임도헌

History
Date        Author   Status    Description
2024.11.19  임도헌   Created
2024.11.19  임도헌   Modified  스트리밍 삭제 버튼 추가
2025.05.16  임도헌   Modified  status props 추가

*/
"use client";
import { useRouter } from "next/navigation";
import { DeleteResponse } from "../post/comment/CommentDeleteButton";

interface IStreamDeleteButton {
  streamId: string;
  id: number;
  status: string;
  onDelete: (streamId: string, id: number) => Promise<DeleteResponse>;
}

export default function StreamDeleteButton({
  streamId,
  id,
  status,
  onDelete,
}: IStreamDeleteButton) {
  const router = useRouter();
  const handleDeleteClick = async () => {
    if (confirm("영상을 삭제하시겠습니까")) {
      try {
        const response = await onDelete(streamId, id);
        if (response.success) {
          alert("스트리밍 삭제에 성공했습니다.");
          router.push("/live");
        } else {
          alert(response.error);
        }
      } catch (e) {
        console.error(e);
        alert("스트리밍 삭제에 실패했습니다.");
      }
    }
  };

  // 방송 중이거나 상태가 없는 경우 삭제 버튼을 숨김
  const isStreaming = status === "connected";
  if (isStreaming) return null;

  return (
    <button
      onClick={handleDeleteClick}
      className="w-full flex items-center justify-center flex-1 font-semibold text-white my-2 h-8 px-auto sm:text-lg md:text-xl bg-rose-600 rounded-md hover:bg-rose-500 transition-colors"
    >
      스트리밍 삭제
    </button>
  );
}
