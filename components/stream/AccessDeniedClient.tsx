/**
 * File Name : components/stream/guard/AccessDeniedClient
 * Description : 403 사유별 안내 + CTA(팔로우/로그인/언락) 처리
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2025.09.06  임도헌   Created
 * 2025.11.01  임도헌   Modified  로그인 파라미터 callbackUrl 통일, useFollowToggle 호출 정합
 * 2025.11.22  임도헌   Modified  로그인 요구 시 callbackUrl 재진입 방지(loginRequired 플래그 도입)
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
  callbackUrl,
  streamId,
  ownerId,
  viewerId,
}: {
  reason: Reason;
  username: string;
  callbackUrl: string; // 통일
  streamId?: number;
  ownerId?: number;
  viewerId: number | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  // 이전 코드: const { follow, isPending } = useFollowToggle();
  // 우리 훅 시그니처 기준(최근 리팩토링): toggle / isPending
  const { toggle, isPending } = useFollowToggle();

  const pending = typeof ownerId === "number" ? isPending(ownerId) : false;

  const goLogin = () =>
    router.push(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);

  const goProfileForFollow = () =>
    router.push(`/profile/${encodeURIComponent(username)}`); // 경로 일관화

  const doFollow = async () => {
    if (!ownerId) return goProfileForFollow();

    // 403 FOLLOWERS_ONLY는 보통 '현재 미팔로우' 상황이므로 was=false 가정
    let loginRequired = false;

    await toggle(ownerId, false, {
      viewerId,
      refresh: false,
      onRequireLogin: () => {
        loginRequired = true;
        goLogin();
      },
    });

    // 로그인 요구가 발생하지 않은 경우에만 가드 재평가
    if (!loginRequired) {
      router.replace(callbackUrl);
    }
  };

  return (
    <div className="mx-auto max-w-md px-6 py-12 text-center">
      <h1 className="mb-3 text-2xl font-bold text-black dark:text-white">
        접근할 수 없습니다
      </h1>

      {reason === "FOLLOWERS_ONLY" && (
        <>
          <p className="mb-6 text-neutral-700 dark:text-neutral-300">
            <b>@{username}</b>님의 방송은 <b>팔로워 전용</b>입니다.
          </p>
          <div className="flex justify-center gap-2">
            {typeof ownerId === "number" ? (
              <button
                onClick={doFollow}
                disabled={pending}
                className="rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:opacity-60"
              >
                {pending ? "처리 중..." : "지금 팔로우하고 입장"}
              </button>
            ) : (
              <button
                onClick={goProfileForFollow}
                className="rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
              >
                프로필로 가서 팔로우하기
              </button>
            )}
            <button
              onClick={goLogin}
              className="rounded-md bg-neutral-200 px-4 py-2 text-neutral-900 hover:bg-neutral-300 dark:bg-neutral-700 dark:text-white dark:hover:bg-neutral-600"
            >
              로그인
            </button>
          </div>
        </>
      )}

      {reason === "PRIVATE" && (
        <>
          <p className="mb-6 text-neutral-700 dark:text-neutral-300">
            <b>@{username}</b>님의 방송은 <b>비밀번호가 있어야</b> 시청할 수
            있습니다.
          </p>
          <div className="flex justify-center gap-2">
            {typeof streamId === "number" ? (
              <button
                onClick={() => setOpen(true)}
                className="rounded-md bg-amber-600 px-4 py-2 text-white hover:bg-amber-700"
              >
                비밀번호 입력
              </button>
            ) : (
              <button
                onClick={() => router.push(callbackUrl)}
                className="rounded-md bg-amber-600 px-4 py-2 text-white hover:bg-amber-700"
              >
                시청 페이지로 이동
              </button>
            )}
            <button
              onClick={goLogin}
              className="rounded-md bg-neutral-200 px-4 py-2 text-neutral-900 hover:bg-neutral-300 dark:bg-neutral-700 dark:text-white dark:hover:bg-neutral-600"
            >
              로그인
            </button>
          </div>

          {typeof streamId === "number" && (
            <PrivateAccessModal
              open={open}
              onOpenChange={setOpen}
              streamId={streamId}
              redirectHref={callbackUrl} // 통일
            />
          )}
        </>
      )}

      {reason === "UNKNOWN" && (
        <>
          <p className="mb-6 text-neutral-700 dark:text-neutral-300">
            접근 권한을 확인할 수 없습니다.
          </p>
          <button
            onClick={() => router.push(callbackUrl)}
            className="rounded-md bg-neutral-800 px-4 py-2 text-white hover:bg-neutral-900"
          >
            돌아가기
          </button>
        </>
      )}
    </div>
  );
}
