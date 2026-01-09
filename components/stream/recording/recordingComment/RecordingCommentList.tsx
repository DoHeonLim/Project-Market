/**
 * File Name : components/stream/recordingComment/RecordingCommentList
 * Description : 스트리밍 댓글 리스트 컴포넌트
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2025.08.05  임도헌   Created   녹화본 댓글 리스트 출력
 * 2025.09.10  임도헌   Modified  IntersectionObserver 안정화, rootMargin/threshold 조정, a11y/폴백 추가
 */

"use client";

import { useEffect, useRef } from "react";
import RecordingCommentItem from "@/components/stream/recording/recordingComment/RecordingCommentItem";
import { useRecordingCommentContext } from "@/components/stream/recording/recordingComment/RecordingCommentContext";

export default function RecordingCommentList({
  currentUserId,
}: {
  currentUserId: number;
}) {
  const { comments, isLoading, hasNextPage, loadMore, isFetchingNextPage } =
    useRecordingCommentContext();

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hasNextPage || isFetchingNextPage) return;

    const sentinel = bottomRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) loadMore();
      },
      { root: null, rootMargin: "400px 0px", threshold: 0 }
    );

    observer.observe(sentinel);
    return () => {
      observer.unobserve(sentinel);
      observer.disconnect();
    };
  }, [hasNextPage, isFetchingNextPage, loadMore]);

  return (
    <div
      className="space-y-4 mt-6"
      aria-busy={isLoading || isFetchingNextPage}
      aria-live="polite"
    >
      {isLoading ? (
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          댓글 불러오는 중...
        </p>
      ) : comments.length === 0 ? (
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          첫 댓글을 남겨보세요.
        </p>
      ) : (
        <ul className="space-y-4">
          {comments.map((comment) => (
            <li key={comment.id}>
              <RecordingCommentItem
                comment={comment}
                currentUserId={currentUserId}
              />
            </li>
          ))}
        </ul>
      )}

      {hasNextPage && (
        <div className="flex items-center justify-center pt-2">
          <button
            type="button"
            onClick={loadMore}
            disabled={isFetchingNextPage}
            className="px-3 py-1.5 text-sm rounded-md border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 disabled:opacity-60"
          >
            {isFetchingNextPage ? "불러오는 중…" : "더 보기"}
          </button>
        </div>
      )}
      <div ref={bottomRef} className="h-6" />
    </div>
  );
}
