/**
 * File Name : components/stream/RTMPInfoModal
 * Description : 스트리밍 생성 완료 후 RTMP URL과 스트림 키 정보를 보여주는 모달
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2025.07.30  임도헌   Created   RTMP 정보 모달 컴포넌트 분리
 * 2025.08.19  임도헌   Modified  복사 버튼/키 마스킹/보기 토글/접근성(ESC+TabTrap)/보안 경고/prop명 정리(rtmpUrl, streamKey)
 * 2025.08.19  임도헌   Modified  이동 버튼 복구(useRouter push), 키 재발급 기능/토스트(sonner) 및 버튼 색상/라벨 프로젝트 스타일 적용
 * 2025.09.09  임도헌   Modified  ConfirmDialog 연동 보강(ESC/백드롭 클릭 시 닫기), 포커스 트랩/바디 스크롤 잠금/오버레이 추가
 * 2025.09.22  임도헌   Modified  createdNewLiveInput 분기 제거, 삭제는 명시적 버튼 클릭 시에만 확인창 오픈
 * 2025.09.25  임도헌   Modified  복사버튼 클릭시 토스트 메세지 추가
 */

"use client";

import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import {
  XMarkIcon,
  EyeIcon,
  EyeSlashIcon,
  ClipboardIcon,
  CheckIcon,
  ArrowTopRightOnSquareIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import {
  deleteLiveInputAction,
  rotateLiveInputKeyAction,
  deleteBroadcastAction,
} from "@/app/streams/[id]/actions";

interface RTMPInfoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rtmpUrl: string;
  streamKey: string;
  liveInputId: number;
  broadcastId?: number;
}

export default function RTMPInfoModal({
  open,
  onOpenChange,
  rtmpUrl,
  streamKey,
  liveInputId,
  broadcastId,
}: RTMPInfoModalProps) {
  const router = useRouter();
  // 패널 참조 (포커스 트랩 등에서 사용)
  const panelRef = useRef<HTMLDivElement>(null);
  const firstFocusRef = useRef<HTMLButtonElement>(null);

  // 트래킹: 사용자가 "스트리밍 페이지로 이동"을 눌러 네비게이션 했는지 여부
  // 네비게이션했으면 닫기 시 브로드캐스트 삭제를 수행하지 않음
  const navigatedToBroadcastRef = useRef(false);

  // 표시용 상태(재발급 후 최신값 갱신)
  const [rtmpUrlState, setRtmpUrlState] = useState(rtmpUrl);
  const [streamKeyState, setStreamKeyState] = useState(streamKey);
  useEffect(() => {
    setRtmpUrlState(rtmpUrl);
    setStreamKeyState(streamKey);
  }, [rtmpUrl, streamKey]);

  const [showKey, setShowKey] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);

  const [isRotating, startRotate] = useTransition();
  const [isDeleting, startDelete] = useTransition();

  // 확인 모달 오픈 상태(명시적 버튼 클릭 시에만 true)
  const [confirmOpen, setConfirmOpen] = useState(false);

  // 스트림 키 마스킹 (길이 고정 느낌 유지)
  const maskedKey = useMemo(() => {
    const len = Math.max(streamKeyState?.length || 0, 12);
    return "•".repeat(len);
  }, [streamKeyState]);

  // 열릴 때 첫 포커스 + 바디 스크롤 잠금
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => firstFocusRef.current?.focus(), 0);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      clearTimeout(t);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  // ESC / Tab Trap -> Escape는 닫기 로직(handleClose)으로 연결
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        // 닫기 시 브로드캐스트 삭제 여부를 결정하는 공통 핸들러
        handleClose();
      }
      // 간단 포커스 트랩
      if (e.key === "Tab" && panelRef.current) {
        const focusables = panelRef.current.querySelectorAll<HTMLElement>(
          'a, button, input, textarea, select, details,[tabindex]:not([tabindex="-1"])'
        );
        const list = Array.from(focusables).filter(
          (el) => !el.hasAttribute("disabled")
        );
        if (list.length === 0) return;
        const first = list[0];
        const last = list[list.length - 1];
        const active = document.activeElement as HTMLElement | null;

        if (!e.shiftKey && active === last) {
          e.preventDefault();
          first.focus();
        } else if (e.shiftKey && active === first) {
          e.preventDefault();
          last.focus();
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // NOTE:
  // 백드롭(오버레이) 클릭으로 모달을 닫히지 않도록 변경했습니다.
  // (요청: 스트리밍 추가 시 모달창 옆 클릭시 닫힘 방지)
  // 패널 내부는 기존처럼 stopPropagation으로 외부로 이벤트 전파를 막습니다.

  const copy = async (text: string, which: "url" | "key") => {
    try {
      await navigator.clipboard.writeText(text);
      if (which === "url") {
        setCopiedUrl(true);
        setTimeout(() => setCopiedUrl(false), 1500);
      } else {
        setCopiedKey(true);
        setTimeout(() => setCopiedKey(false), 1500);
      }
      toast.success("클립보드 복사 성공");
    } catch {
      toast.error("클립보드 복사 실패", { description: "다시 시도해주세요." });
    }
  };

  const handleRotate = () => {
    startRotate(async () => {
      try {
        const res = await rotateLiveInputKeyAction(liveInputId);
        if (!res?.success) {
          toast.error("키 재발급에 실패했습니다.", {
            description: res?.error || "잠시 후 다시 시도해주세요.",
          });
          return;
        }
        setRtmpUrlState(res.rtmpUrl!);
        setStreamKeyState(res.streamKey!);
        setShowKey(true); // 재발급 직후 확인 가능하게 표시
        toast.success("스트림 키가 재발급되었습니다.", {
          description: "새 키가 적용되었고 기존 키는 즉시 사용 불가입니다.",
        });
      } catch {
        toast.error("키 재발급 중 오류가 발생했습니다.", {
          description: "네트워크 또는 서버 오류일 수 있습니다.",
        });
      }
    });
  };

  const handleConfirmDelete = () => {
    startDelete(async () => {
      try {
        const res = await deleteLiveInputAction(liveInputId);
        if (!res?.success) {
          toast.error("Live Input 삭제 실패", {
            description: res?.error || "잠시 후 다시 시도해주세요.",
          });
          return;
        }
        toast.success("Live Input이 삭제되었습니다.");
      } finally {
        setConfirmOpen(false);
        onOpenChange(false);
      }
    });
  };

  // 닫기 공통 로직: 사용자가 "스트리밍 페이지로 이동" 하지 않았다면
  // 생성된 broadcast를 삭제하여 중복 생성을 방지합니다.
  const handleClose = () => {
    // 만약 네비게이트 했으면 즉시 닫기
    if (navigatedToBroadcastRef.current || !broadcastId) {
      onOpenChange(false);
      return;
    }

    // broadcastId가 있고 네비게이션 하지 않았다면 삭제 시도
    startDelete(async () => {
      try {
        const res = await deleteBroadcastAction(broadcastId!);
        if (res?.success) {
          toast.success("생성된 방송이 취소되었습니다.");
          // 캐시 무효화 등은 서버 action 내부에서 처리됨
        } else {
          toast.error("방송 취소에 실패했습니다.", {
            description: res?.error || "잠시 후 다시 시도해주세요.",
          });
        }
      } catch (e) {
        console.error("[RTMPInfoModal] deleteBroadcastAction failed", e);
        toast.error("방송 취소 중 오류가 발생했습니다.");
      } finally {
        onOpenChange(false);
      }
    });
  };

  if (!open) return null;

  return (
    <div
      // 오버레이은 그대로 유지하되, 클릭으로 닫히지 않도록 onMouseDown 제거
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70"
      aria-hidden={!open}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="rtmp-title"
        className="relative mx-auto w-[min(680px,92vw)] rounded-2xl bg-white p-6 shadow-xl dark:bg-neutral-900"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <h2
            id="rtmp-title"
            className="text-xl font-semibold text-black dark:text-white"
          >
            방송 송출 정보 (RTMP)
          </h2>
          <button
            type="button"
            onClick={handleClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-black hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white dark:hover:bg-white/5"
            aria-label="닫기"
            disabled={isDeleting}
          >
            <XMarkIcon
              className={`h-5 w-5 ${isDeleting ? "animate-pulse opacity-70" : ""}`}
            />
          </button>
        </div>

        <p
          id="rtmp-desc"
          className="mt-2 text-sm text-neutral-600 dark:text-neutral-400"
        >
          아래 정보를 방송 소프트웨어(OBS 등)에 입력하세요.{" "}
          <span className="font-medium">스트림 키는 비공개</span>로 안전하게
          보관하세요.
        </p>

        {/* RTMP URL */}
        <div className="mt-5">
          <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            RTMP URL
          </label>
          <div className="flex items-center gap-2">
            <input
              value={rtmpUrlState}
              readOnly
              className="w-full flex-1 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm font-mono text-neutral-900 dark:border-neutral-800 dark:bg-neutral-800 dark:text-neutral-100"
              aria-describedby="rtmp-desc"
            />
            <button
              type="button"
              ref={firstFocusRef}
              onClick={() => copy(rtmpUrlState, "url")}
              className="inline-flex items-center gap-1 rounded-xl border border-neutral-200 px-3 py-2 text-sm text-black hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-neutral-700 dark:text-white dark:hover:bg-white/5"
            >
              {copiedUrl ? (
                <>
                  <CheckIcon className="h-4 w-4" />
                  복사됨
                </>
              ) : (
                <>
                  <ClipboardIcon className="h-4 w-4" />
                  복사
                </>
              )}
            </button>
          </div>
        </div>

        {/* Stream Key */}
        <div className="mt-4">
          <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            스트림 키
          </label>
          <div className="flex flex-wrap items-center gap-2">
            <input
              value={showKey ? streamKeyState : maskedKey}
              readOnly
              className="w-full flex-1 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm font-mono text-neutral-900 dark:border-neutral-800 dark:bg-neutral-800 dark:text-neutral-100"
              aria-label="스트림 키"
            />
            <button
              type="button"
              onClick={() => setShowKey((v) => !v)}
              className="inline-flex items-center gap-1 rounded-xl border border-neutral-200 px-3 py-2 text-sm text-black hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-neutral-700 dark:text-white dark:hover:bg-white/5"
              aria-pressed={showKey}
              aria-label={showKey ? "키 숨기기" : "키 보기"}
            >
              {showKey ? (
                <EyeSlashIcon className="h-4 w-4" />
              ) : (
                <EyeIcon className="h-4 w-4" />
              )}
              {showKey ? "숨기기" : "보기"}
            </button>
            <button
              type="button"
              onClick={() => copy(streamKeyState, "key")}
              className="inline-flex items-center gap-1 rounded-xl border border-neutral-200 px-3 py-2 text-sm text-black hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-neutral-700 dark:text-white dark:hover:bg-white/5"
            >
              {copiedKey ? (
                <>
                  <CheckIcon className="h-4 w-4" />
                  복사됨
                </>
              ) : (
                <>
                  <ClipboardIcon className="h-4 w-4" />
                  복사
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleRotate}
              disabled={isRotating}
              className="inline-flex items-center gap-2 rounded-xl border border-amber-300 px-3 py-2 text-sm text-amber-700 hover:bg-amber-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 dark:border-amber-500 dark:text-amber-400 dark:hover:bg-amber-500/10"
              title="스트림 키 재발급"
            >
              <ArrowPathIcon
                className={`h-4 w-4 ${isRotating ? "animate-spin" : ""}`}
              />
              {isRotating ? "재발급 중..." : "키 재발급"}
            </button>
          </div>
          <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
            ⚠ 스트림 키가 유출되었다면 즉시 키를 교체하세요. (재발급 시 기존
            키는 즉시 사용 불가)
          </p>
        </div>

        {/* 하단 버튼들 */}
        <div className="mt-6 flex flex-wrap justify-between gap-2">
          {/* 좌측: 위험 동작(삭제) */}
          <button
            type="button"
            onClick={() => setConfirmOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-red-300 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 dark:border-red-500 dark:text-red-400 dark:hover:bg-red-500/10"
            title="Live Input 삭제"
            disabled={isDeleting}
          >
            {isDeleting ? "삭제 중..." : "Live Input 삭제"}
          </button>

          {/* 우측: 이동/닫기 */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleClose}
              className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 px-4 py-2 text-sm font-medium text-black hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-neutral-700 dark:text-white dark:hover:bg-white/5"
            >
              닫기
            </button>

            <button
              type="button"
              onClick={() => {
                if (!broadcastId) return;
                // 네비게이션 플래그 세팅: 이동 후 닫기 시 브로드캐스트 삭제를 하지 않음
                navigatedToBroadcastRef.current = true;
                onOpenChange(false);
                router.push(`/streams/${broadcastId}`);
              }}
              disabled={!broadcastId}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 dark:bg-indigo-500 dark:hover:bg-indigo-600"
              title={
                broadcastId
                  ? "스트리밍 페이지로 이동"
                  : "생성된 방송 ID가 없어 이동할 수 없습니다"
              }
            >
              <ArrowTopRightOnSquareIcon className="h-4 w-4" />
              스트리밍 페이지로 이동
            </button>
          </div>
        </div>
      </div>

      {/* 확인 모달 — 명시적 삭제 버튼 클릭 시에만 오픈 */}
      <ConfirmDialog
        open={confirmOpen}
        title="Live Input을 삭제할까요?"
        description="삭제 후에는 다시 스트림 키를 발급해야 방송을 시작할 수 있습니다."
        confirmLabel="삭제"
        cancelLabel="취소"
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmOpen(false)}
        loading={isDeleting}
      />
    </div>
  );
}
