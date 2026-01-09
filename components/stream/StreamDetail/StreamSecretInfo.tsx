/**
 * File Name : components/stream/streamDetail/StreamSecretInfo
 * Description : 본인 방송 전용 RTMP/Key 정보 (키는 기본 숨김, 아이콘형 복사 버튼)
 * Author : 임도헌
 *
 * History
 * 2025.07.31  임도헌   Created
 * 2025.09.09  임도헌   Modified  alert→toast, 복사 가드, a11y
 * 2025.09.15  임도헌   Modified  키 기본 숨김 + 개별 보기 토글, 아이콘형 복사 버튼(성공 피드백)
 */
"use client";

import { useId, useMemo, useState, useTransition } from "react";
import {
  EyeIcon,
  EyeSlashIcon,
  ClipboardIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import { toast } from "sonner";
import { getStreamKey } from "@/lib/stream/getStreamKey";

interface StreamSecretInfoProps {
  /** Broadcast id */
  broadcastId: number;
  /** 서버에서 미리 주입한 초기 키(선택). 없으면 패널 열 때 서버 액션으로 로드 */
  initialStreamKey?: string | null;
}

function IconGhostButton({
  title,
  onClick,
  showCheck,
  disabled,
}: {
  title: string;
  onClick: () => void;
  showCheck?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      disabled={disabled}
      onClick={onClick}
      className="
        inline-flex h-8 w-8 items-center justify-center rounded-md
        border border-neutral-300/70 hover:bg-neutral-50
        dark:border-neutral-700/70 dark:hover:bg-neutral-800
        disabled:opacity-50
      "
    >
      {showCheck ? (
        <CheckIcon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
      ) : (
        <ClipboardIcon className="h-4 w-4 text-neutral-600 dark:text-neutral-300" />
      )}
    </button>
  );
}

export default function StreamSecretInfo({
  broadcastId,
  initialStreamKey,
}: StreamSecretInfoProps) {
  const [open, setOpen] = useState(false); // 패널 접기/펼치기
  const [reveal, setReveal] = useState(false); // 키 보기/숨기기
  const [copiedURL, setCopiedURL] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [rtmpUrl, setRtmpUrl] = useState<string | null>(null);
  const [streamKey, setStreamKey] = useState<string | null>(
    initialStreamKey ?? null
  );
  const [isPending, startTransition] = useTransition();
  const panelId = useId();

  // ENV 폴백은 서버 액션에서 처리하지만, 초기 렌더에서 표시용 폴백 유지
  const fallbackRtmp = useMemo(
    () =>
      process.env.NEXT_PUBLIC_CLOUDFLARE_RTMP_URL?.trim() ||
      "rtmps://live.cloudflare.com:443/live/",
    []
  );

  const effectiveRtmp = rtmpUrl ?? fallbackRtmp;

  const maskedKey = useMemo(() => {
    const key = streamKey ?? "";
    return key ? "•".repeat(key.length) : "";
  }, [streamKey]);

  const fetchCreds = () =>
    startTransition(async () => {
      const res = await getStreamKey(broadcastId);
      if (!res.success) {
        const msg =
          res.error === "FORBIDDEN"
            ? "권한이 없습니다."
            : res.error === "NOT_FOUND"
              ? "방송을 찾을 수 없습니다."
              : "로그인이 필요합니다.";
        toast.error(msg);
        return;
      }
      setRtmpUrl(res.rtmpUrl);
      setStreamKey(res.streamKey);
    });

  const onTogglePanel = () => {
    const next = !open;
    setOpen(next);
    if (next) {
      setReveal(false); // 열 때 항상 숨김으로 시작
      if (!streamKey || !rtmpUrl) fetchCreds();
    }
  };

  const copy = async (text: string, label: "URL" | "Secret Key") => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label}가 복사되었습니다.`);
      if (label === "URL") {
        setCopiedURL(true);
        setTimeout(() => setCopiedURL(false), 1200);
      } else {
        setCopiedKey(true);
        setTimeout(() => setCopiedKey(false), 1200);
      }
    } catch {
      toast.error("클립보드 복사에 실패했습니다.", {
        description: "브라우저 권한을 확인하고 다시 시도해주세요.",
      });
    }
  };

  return (
    <>
      {/* 패널 토글 */}
      <button
        type="button"
        onClick={onTogglePanel}
        className="
          mb-2 inline-flex items-center gap-2 rounded-full
          border border-neutral-300 px-3 py-1.5 text-sm font-semibold
          text-neutral-800 hover:bg-neutral-50
          dark:border-neutral-700 dark:text-neutral-100 dark:hover:bg-neutral-800
        "
        aria-expanded={open}
        aria-controls={panelId}
      >
        {open ? (
          <>
            <EyeSlashIcon className="h-5 w-5" />
            스트리밍 정보 숨기기
          </>
        ) : (
          <>
            <EyeIcon className="h-5 w-5" />
            스트리밍 정보 보기
          </>
        )}
      </button>

      {open && (
        <div
          id={panelId}
          role="region"
          aria-label="스트리밍 비공개 정보"
          className="
            space-y-3 rounded-lg border border-neutral-200 bg-white p-4 text-sm text-neutral-900
            dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100
          "
        >
          {/* RTMP URL */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="shrink-0 font-bold">스트리밍 URL</span>
            <code className="min-w-0 flex-1 break-all font-mono text-[13px]">
              {effectiveRtmp}
            </code>
            <IconGhostButton
              title={isPending ? "불러오는 중..." : "URL 복사"}
              onClick={() => copy(effectiveRtmp, "URL")}
              showCheck={copiedURL}
              disabled={isPending}
            />
          </div>

          {/* Secret Key (기본 숨김, 개별 토글) */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="shrink-0 font-bold">Secret Key</span>
            <code className="min-w-0 flex-1 break-all font-mono text-[13px]">
              {reveal ? (streamKey ?? "") : maskedKey}
            </code>

            <button
              type="button"
              title={reveal ? "키 숨기기" : "키 보기"}
              aria-label={reveal ? "키 숨기기" : "키 보기"}
              onClick={() => {
                if (!streamKey) fetchCreds();
                setReveal((v) => !v);
              }}
              className="
                inline-flex h-8 w-8 items-center justify-center rounded-md
                border border-neutral-300/70 hover:bg-neutral-50
                dark:border-neutral-700/70 dark:hover:bg-neutral-800
              "
              disabled={isPending}
            >
              {reveal ? (
                <EyeSlashIcon className="h-4 w-4 text-neutral-600 dark:text-neutral-300" />
              ) : (
                <EyeIcon className="h-4 w-4 text-neutral-600 dark:text-neutral-300" />
              )}
            </button>

            <IconGhostButton
              title={isPending ? "불러오는 중..." : "Secret Key 복사"}
              onClick={() => {
                if (!streamKey) {
                  toast.error(
                    "키를 불러오고 있습니다. 잠시 후 다시 시도하세요."
                  );
                  return;
                }
                copy(streamKey, "Secret Key");
              }}
              showCheck={copiedKey}
              disabled={isPending || !streamKey}
            />
          </div>

          <p className="pt-1 text-[12px] text-neutral-500 dark:text-neutral-400">
            * 이 정보는 방송 소유자에게만 보입니다. 스트림 키는 외부에 공유하지
            마세요.
          </p>
        </div>
      )}
    </>
  );
}
