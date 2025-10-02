/**
 * File Name : components/stream/guard/AccessDeniedClient
 * Description : 403 사유별 안내 + CTA(팔로우/로그인/언락) 처리
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2025.09.06  임도헌   Created
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PrivateAccessModal from "@/components/stream/PrivateAccessModal";
import { useFollowToggle } from "@/hooks/useFollowToggle";

type Reason = "PRIVATE" | "FOLLOWERS_ONLY" | "UNKNOWN";

export default function AccessDeniedClient({
  reason,
  username,
  next,
  streamId,
  ownerId,
}: {
  reason: Reason;
  username: string;
  next: string;
  streamId?: number;
  ownerId?: number;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { follow, isPending } = useFollowToggle();
  const pending = typeof ownerId === "number" ? isPending(ownerId) : false;

  const goLogin = () => router.push(`/login?next=${encodeURIComponent(next)}`);
  const goProfileForFollow = () =>
    router.push(`/@${encodeURIComponent(username)}`);

  const doFollow = async () => {
    if (!ownerId) return goProfileForFollow();
    await follow(ownerId, {
      refresh: false, // 훅 내부 refresh 끄기
      onRequireLogin: () => goLogin(), // 401이면 로그인으로
    });
    // 팔로우 성공 시 접근 가드 재평가
    router.replace(next);
  };

  return (
    <div className="mx-auto max-w-md px-6 py-12 text-center">
      <h1 className="text-2xl font-bold text-black dark:text-white mb-3">
        접근할 수 없습니다
      </h1>

      {reason === "FOLLOWERS_ONLY" && (
        <>
          <p className="text-neutral-700 dark:text-neutral-300 mb-6">
            <b>@{username}</b>님의 방송은 <b>팔로워 전용</b>입니다.
          </p>
          <div className="flex gap-2 justify-center">
            {typeof ownerId === "number" ? (
              <button
                onClick={doFollow}
                disabled={pending}
                className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60"
              >
                {pending ? "처리 중..." : "지금 팔로우하고 입장"}
              </button>
            ) : (
              <button
                onClick={goProfileForFollow}
                className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700"
              >
                프로필로 가서 팔로우하기
              </button>
            )}
            <button
              onClick={goLogin}
              className="px-4 py-2 rounded-md bg-neutral-200 dark:bg-neutral-700 dark:text-white hover:bg-neutral-300 dark:hover:bg-neutral-600"
            >
              로그인
            </button>
          </div>
        </>
      )}

      {reason === "PRIVATE" && (
        <>
          <p className="text-neutral-700 dark:text-neutral-300 mb-6">
            <b>@{username}</b>님의 방송은 <b>비밀번호가 있어야</b> 시청할 수
            있습니다.
          </p>
          <div className="flex gap-2 justify-center">
            {typeof streamId === "number" ? (
              <button
                onClick={() => setOpen(true)}
                className="px-4 py-2 rounded-md bg-amber-600 text-white hover:bg-amber-700"
              >
                비밀번호 입력
              </button>
            ) : (
              <button
                onClick={() => router.push(next)}
                className="px-4 py-2 rounded-md bg-amber-600 text-white hover:bg-amber-700"
              >
                시청 페이지로 이동
              </button>
            )}
            <button
              onClick={goLogin}
              className="px-4 py-2 rounded-md bg-neutral-200 dark:bg-neutral-700 dark:text-white hover:bg-neutral-300 dark:hover:bg-neutral-600"
            >
              로그인
            </button>
          </div>

          {typeof streamId === "number" && (
            <PrivateAccessModal
              open={open}
              onOpenChange={setOpen}
              streamId={streamId}
              redirectHref={next}
            />
          )}
        </>
      )}

      {reason === "UNKNOWN" && (
        <>
          <p className="text-neutral-700 dark:text-neutral-300 mb-6">
            접근 권한을 확인할 수 없습니다.
          </p>
          <button
            onClick={() => router.push(next)}
            className="px-4 py-2 rounded-md bg-neutral-800 text-white hover:bg-neutral-900"
          >
            돌아가기
          </button>
        </>
      )}
    </div>
  );
}
