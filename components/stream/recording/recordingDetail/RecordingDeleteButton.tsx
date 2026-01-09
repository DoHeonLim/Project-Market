/**
 * File Name : components/stream/recording/recordingDetail/RecordingDeleteButton
 * Description : 녹화(ENDED) 상세에서 방송/녹화 자원 삭제 버튼
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2025.09.17  임도헌   Created   라이브 상세에서 분리하여 녹화 페이지 전용으로 이동
 */

"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import ConfirmDialog from "@/components/common/ConfirmDialog";

interface RecordingDeleteButtonProps {
  /** Broadcast id */
  broadcastId: number;
  /** Cloudflare LiveInput UID */
  liveInputUid: string;
  username: string;
}

export default function RecordingDeleteButton({
  broadcastId,
  liveInputUid,
  username,
}: RecordingDeleteButtonProps) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `/api/streams/${broadcastId}/delete?uid=${encodeURIComponent(liveInputUid)}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
        }
      );

      const data = (await res.json().catch(() => ({}))) as {
        success?: boolean;
        error?: string;
      };

      if (!res.ok || !data?.success) {
        toast.error(data?.error ?? "삭제에 실패했습니다.");
        return;
      }

      toast.success("방송 및 연결된 녹화 데이터가 삭제되었습니다.");
      setConfirmOpen(false);
      router.push(`/profile/${username}/channel`);
    } catch (e) {
      console.error("[RecordingDeleteButton] delete failed:", e);
      toast.error("삭제 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setConfirmOpen(true)}
        disabled={loading}
        aria-busy={loading || undefined}
        className="my-2 flex h-10 w-full items-center justify-center rounded-md bg-rose-600 px-4 font-semibold text-white transition-colors hover:bg-rose-500"
      >
        {loading ? "삭제 중..." : "녹화 삭제"}
      </button>

      <ConfirmDialog
        open={confirmOpen}
        title="녹화를 삭제할까요?"
        description="방송 레코드와 연결된 녹화(VOD) 데이터가 함께 삭제됩니다. 이 작업은 되돌릴 수 없습니다."
        confirmLabel="삭제"
        cancelLabel="취소"
        onConfirm={handleConfirm}
        onCancel={() => setConfirmOpen(false)}
        loading={loading}
      />
    </>
  );
}
