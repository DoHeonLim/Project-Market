/**
 * File Name : components/stream/channel/RecordingEmptyState
 * Description : 다시보기 비어있을 때 보여줄 카드형 빈 상태
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2025.08.09  임도헌   Created   CTA 포함 빈 상태 카드
 * 2025.08.10  임도헌   Modified  팔로우 상태일 경우 CTA 버튼 숨김
 */
"use client";

import Link from "next/link";

type Role = "OWNER" | "FOLLOWER" | "VISITOR";

export default function RecordingEmptyState({
  role,
  isFollowing,
  onFollow,
}: {
  role: Role;
  isFollowing?: boolean;
  onFollow?: () => void;
}) {
  const showFollowButton = role !== "OWNER" && isFollowing === false; // 팔로우 상태일 경우 버튼 숨김

  return (
    <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/80 p-6 text-center shadow-sm">
      <div className="mx-auto mb-3 h-10 w-10 rounded-full bg-neutral-100 dark:bg-neutral-700/60 flex items-center justify-center">
        <span className="text-xl">🎞️</span>
      </div>
      <h3 className="text-neutral-900 dark:text-white text-base font-semibold mb-1">
        아직 다시보기가 없어요
      </h3>
      <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
        방송이 끝나면 녹화본이 여기에 표시됩니다.
      </p>

      {role === "OWNER" ? (
        <Link
          href="/streams/add"
          className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-primary text-white text-sm hover:bg-primary/90"
        >
          첫 라이브 시작하기
        </Link>
      ) : (
        showFollowButton && (
          <button
            type="button"
            onClick={onFollow}
            className={`inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm text-white
              ${onFollow ? "bg-primary hover:bg-primary/90" : "bg-neutral-700 cursor-not-allowed"}`}
          >
            팔로우하고 새 방송 알림 받기
          </button>
        )
      )}
    </div>
  );
}
