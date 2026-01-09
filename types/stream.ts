/**
 * File Name : types/stream
 * Description : 스트리밍/방송(Broadcast) + 녹화(VOD) 공용 타입
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2025.08.03  임도헌   Created
 * 2025.08.07  임도헌   Modified  녹화본 타입 정의
 * 2025.09.22  임도헌   Modified  라이브/방송/녹화 타입 슬림화 + VOD 전환
 * 2025.11.26  임도헌   Modified  BroadCastSummary에 vodIdForRecording 추가
 */

// 공통 원시 타입
export type ViewerRole = "OWNER" | "FOLLOWER" | "VISITOR";

export const STREAM_VISIBILITY = {
  PUBLIC: "PUBLIC",
  FOLLOWERS: "FOLLOWERS",
  PRIVATE: "PRIVATE",
} as const;

export type StreamVisibility =
  | (typeof STREAM_VISIBILITY)[keyof typeof STREAM_VISIBILITY]
  | string;

export type StreamStatus = "DISCONNECTED" | "CONNECTED" | "ENDED" | string;

export const VOD_STATUS = {
  QUEUED: "QUEUED",
  INPROGRESS: "INPROGRESS",
  READY: "READY",
  ERROR: "ERROR",
} as const;
export type VodStatus = (typeof VOD_STATUS)[keyof typeof VOD_STATUS];

/* ---------------------------------- 공통 요약 타입 ---------------------------------- */

export interface UserSummary {
  id: number;
  username: string;
  avatar?: string | null;
}

export interface StreamCategory {
  id?: number;
  kor_name: string;
  icon?: string | null;
}

export interface StreamTag {
  id?: number;
  name: string;
}

// 팔로우 모달 등에서 쓰는 확장 요약
export interface UserInfo extends UserSummary {
  _count?: { followers: number; following: number };
  followers?: { follower: UserSummary }[];
  following?: { following: UserSummary }[];
  isFollowing?: boolean;
}

// 방송(세션) 카드: 리스트/그리드 공용

export interface BroadcastCard {
  id: number; // Broadcast PK
  stream_id: string;
  title: string;
  thumbnail: string | null;
  status: "CONNECTED" | "ENDED" | string;
  visibility: StreamVisibility;
  started_at: Date | null;
  ended_at: Date | null;
  user: { id: number; username: string; avatar: string | null };
  category?: { id?: number; kor_name: string; icon?: string | null } | null;
  tags?: string[] | null;
}

/* ---------------------------------- 방송 요약(카드) ---------------------------------- */
/**
 * BroadcastSummary
 * - 리스트/그리드/상세 헤더에서 공통으로 소비하는 가벼운 DTO
 * - stream_id는 Cloudflare LiveInput.provider_uid
 */
export interface BroadcastSummary {
  /** Broadcast PK */
  id: number;

  /**  가장 최근 VodAsset id */
  latestVodId?: number | null;

  /** Cloudflare Live Input UID (iframe/임베드 식별자) */
  stream_id: string;

  title: string;
  thumbnail: string | null;
  isLive?: boolean;
  status: StreamStatus;
  visibility: StreamVisibility;

  started_at: Date | null;
  ended_at: Date | null;

  user: UserSummary;

  category?: StreamCategory | null;
  /** 태그는 중복 제거된 name 배열 권장 */
  tags?: StreamTag[];

  /** 접근성/UI 보조 플래그(서버에서 계산해 전달 가능) */
  requiresPassword?: boolean; // PRIVATE 이면서 비번 설정됨
  followersOnlyLocked?: boolean; // FOLLOWERS 이지만 뷰어가 팔로워가 아님
}

/* ---------------------------------- 녹화(VOD) ---------------------------------- */

export interface VodForGrid {
  /** VodAsset PK */
  vodId: number;
  /** 부모 Broadcast PK — unlock/check 용 */
  broadcastId: number;

  title: string;
  thumbnail: string | null;
  visibility: StreamVisibility;

  user: UserSummary;

  /** 상세 이동 경로 (없으면 /streams/:vodId/recording 폴백) */
  href?: string;

  /** VOD 준비 시각 (VodAsset.ready_at) */
  readyAt: Date | null;

  /** 길이(초) — VodAsset.duration_sec */
  duration?: number;

  /** 조회수 — VodAsset.views */
  viewCount?: number;

  /** 접근 보조 플래그(있으면 우선) */
  requiresPassword?: boolean;
  followersOnlyLocked?: boolean;
}

/** VOD 상세 페이지에서 사용할 수 있는 넉넉한 DTO */
export interface VodForPage extends VodForGrid {
  /** 방송 상태(부모) — 삭제/버튼 표시 분기 등에 유용 */
  broadcastStatus?: StreamStatus;

  /** 추가 메타(원하면 확장) */
  description?: string | null;
  tags?: string[] | null;
}

/* ---------------------------------- 댓글 ---------------------------------- */

export interface StreamComment {
  id: number;
  user: UserSummary;
  payload: string;
  created_at: Date;
}

/* ---------------------------------- 서버 액션 결과/에러 ---------------------------------- */

/** 스트리밍 생성 결과(방송/채널/OBS 연결 정보) */
export type CreateBroadcastResult =
  | {
      success: true;
      liveInputId: number; // 생성/재사용된 LiveInput PK
      broadcastId: number; // 생성된 Broadcast PK
      rtmpUrl: string; // OBS 입력용
      streamKey: string; // OBS 입력용
    }
  | {
      success: false;
      error: string;
    };

/** PRIVATE 해제 관련 에러 코드 */
export type UnlockErrorCode =
  | "NOT_LOGGED_IN"
  | "STREAM_NOT_FOUND"
  | "NOT_PRIVATE_STREAM"
  | "NO_PASSWORD_SET"
  | "INVALID_PASSWORD"
  | "BAD_REQUEST"
  | "MISSING_PASSWORD"
  | "INTERNAL_ERROR";

/** PRIVATE 해제 결과 */
export type UnlockResult =
  | { success: true }
  | { success: false; error: UnlockErrorCode };

/** 에러 코드 → 사용자 메시지 맵 */
export const unlockErrorMessage: Record<UnlockErrorCode, string> = {
  NOT_LOGGED_IN: "로그인이 필요합니다.",
  STREAM_NOT_FOUND: "스트림을 찾을 수 없습니다.",
  NOT_PRIVATE_STREAM: "비공개 스트림이 아닙니다.",
  NO_PASSWORD_SET: "비밀번호가 설정되지 않았습니다.",
  INVALID_PASSWORD: "비밀번호가 올바르지 않습니다.",
  BAD_REQUEST: "요청이 올바르지 않습니다.",
  MISSING_PASSWORD: "비밀번호를 입력해주세요.",
  INTERNAL_ERROR: "일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
};

/* ---------------------------------- 타입 가드/헬퍼 ---------------------------------- */

export const isPrivateVisibility = (v: StreamVisibility) =>
  v === STREAM_VISIBILITY.PRIVATE;

export const isFollowersVisibility = (v: StreamVisibility) =>
  v === STREAM_VISIBILITY.FOLLOWERS;

export const isVodReady = (s: VodStatus) => s === VOD_STATUS.READY;
