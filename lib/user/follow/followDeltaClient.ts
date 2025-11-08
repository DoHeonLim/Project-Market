/**
 * File Name : lib/user/follow/followDeltaClient
 * Description : 팔로우 상태/카운트 동기화를 위한 공용 델타 브로커(클라)
 * Author : 임도헌
 *
 * History
 * 2025.10.31  임도헌  Created  헤더/모달/카드 동시 패치 단일화
 */

type FollowCounts = { viewerFollowing?: number; targetFollowers?: number };

export type FollowDelta = {
  targetUserId: number; // 팔로우 대상(오너) id
  viewerId?: number | null; // 현재 로그인 사용자 id
  delta: 1 | -1 | 0; // 서버 delta(멱등 시 0)
  server?: {
    isFollowing: boolean; // 서버 기준 상태
    counts?: FollowCounts; // 서버 기준 카운트(정합 보정)
  };
};

/**
 * 간단한 이벤트 버스 (브라우저 단일 탭 기준)
 * - 구독: onFollowDelta((d)=>{ ... })
 * - 발행: emitFollowDelta(d)
 */
const followDeltaEventTarget = new EventTarget();

export function onFollowDelta(handler: (delta: FollowDelta) => void) {
  const eventListener: EventListener = (evt: Event) => {
    handler((evt as CustomEvent<FollowDelta>).detail);
  };
  followDeltaEventTarget.addEventListener("follow:delta", eventListener);
  return () =>
    followDeltaEventTarget.removeEventListener("follow:delta", eventListener);
}

// onFollowDelta 핸들러 주석
// - targetUserId: 이번 팔/언의 "대상 사용자" (내가 팔로우한 바로 그 사람)
// - ownerId: 현재 화면의 주인(프로필/채널의 사용자)
//   => targetUserId === ownerId 인 경우에만, 이 화면의 '팔로워 수'에 영향.
//   => 내 following 수는 로컬 토글(onViewerFollowChange) 또는 server.counts.viewerFollowing 값으로만 변경.
export function emitFollowDelta(delta: FollowDelta) {
  followDeltaEventTarget.dispatchEvent(
    new CustomEvent<FollowDelta>("follow:delta", { detail: delta })
  );
}
