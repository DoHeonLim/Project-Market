/**
File Name : components/post/comment/CommentsList
Description : 댓글 목록 컴포넌트
Author : 임도헌

History
Date        Author   Status    Description
2024.11.06  임도헌   Created
2024.11.06  임도헌   Modified  댓글 목록 컴포넌트 추가
2024.11.06  임도헌   Modified  useOptimistic기능으로 댓글 삭제 구현
2024.11.12  임도헌   Modified  프로필 이미지 없을 경우의 코드 추가
2024.11.23  임도헌   Modified  시간이 서버에서 미리 렌더링된 HTML과 클라이언트에서 렌더링된 HTML이 일치하지 않는 문제
                               때문에 생긴 오류를 수정해서 일치시키게 변경
2024.12.07  임도헌   Modified  프로필 이미지 컴포넌트 분리
2024.12.12  임도헌   Modified  댓글 생성 시간 표시 변경
2024.12.25  임도헌   Modified  댓글 목록 스타일 변경
2025.07.06  임도헌   Modified  낙관적 업데이트된 comments 사용
2025.07.06  임도헌   Modified  AnimatePresence로 삭제 애니메이션 활성화
2025.07.11  임도헌   Modified  낙관적 업데이트와 애니메이션 충돌, server 액션 성공 시 댓글 추가 되게 변경
2025.07.11  임도헌   Modified  무한 스크롤 기반으로 리팩토링
2025.08.26  임도헌   Modified  usePageVisibility + 새 useInfiniteScroll 옵션 추가
*/
"use client";

import { useRef } from "react";
import { useComment } from "./CommentContext";
import CommentItem from "./CommentItem";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { AnimatePresence } from "framer-motion";
import { usePageVisibility } from "@/hooks/usePageVisibility";

export default function CommentsList({
  currentUser,
}: {
  currentUser: { id: number; username: string };
}) {
  const isVisible = usePageVisibility();
  const { comments, isLoading, isFetchingNextPage, hasNextPage, loadMore } =
    useComment();
  const triggerRef = useRef<HTMLDivElement>(null);

  useInfiniteScroll({
    triggerRef,
    hasMore: hasNextPage,
    isLoading: isFetchingNextPage,
    onLoadMore: loadMore,
    enabled: isVisible,
    // 코멘트는 카드 높이가 낮으니 여유를 조금 줄인다.
    rootMargin: "600px 0px 0px 0px",
    threshold: 0.05,
  });

  return (
    <div className="flex flex-col gap-4 mt-4">
      <AnimatePresence initial={false}>
        {comments.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            currentUser={currentUser}
          />
        ))}
      </AnimatePresence>
      {isLoading && (
        <>
          <span className="text-center text-neutral-500 dark:text-neutral-300">
            💬 댓글 불러오는 중...
          </span>
        </>
      )}
      {isFetchingNextPage && (
        <span className="text-center text-neutral-500 dark:text-neutral-300">
          ⬇️
        </span>
      )}
      {!isLoading && <div ref={triggerRef} aria-hidden="true" tabIndex={-1} />}
    </div>
  );
}
