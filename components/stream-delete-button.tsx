/**
File Name : components/stream-delete-button
Description : 스트리밍 삭제 버튼
Author : 임도헌

History
Date        Author   Status    Description
2024.11.19  임도헌   Created
2024.11.19  임도헌   Modified  스트리밍 삭제 버튼 추가

*/
"use client";
import { useRouter } from "next/navigation";
import { DeleteResponse } from "./comment-delete-button";

interface IStreamDeleteButton {
  streamId: string;
  id: number;
  isLived: string;
  onDelete: (streamId: string, id: number) => Promise<DeleteResponse>;
}

export default function StreamDeleteButton({
  streamId,
  id,
  isLived,
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
  return (
    <>
      {isLived === null || isLived === "connected" ? null : (
        <button
          onClick={handleDeleteClick}
          className="w-full mt-4 font-semibold text-[10px] text-white bg-rose-600 rounded-md hover:bg-rose-500 transition-colors sm:text-lg md:text-xl"
        >
          스트리밍 삭제
        </button>
      )}
    </>
  );
}
