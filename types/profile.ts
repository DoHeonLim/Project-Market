/**
 * File Name : types/profile
 * Description : 프로필(UI) 전용 타입 — MyProfile 기준 최소 필드 + 팔로우 리스트 타입
 * Author : 임도헌
 *
 * History
 * Date        Author   Status     Description
 * 2025.10.05  임도헌   Created    MyProfile에서 사용하는 필드만 정의
 * 2025.10.12  임도헌   Modified   팔로우 목록 전용 타입 추가(FollowListUser, FollowListCursor)
 * 2026.01.06  임도헌   Modified   FollowListUser.isMutualWithOwner를 boolean 필수로 강제(섹션 분리 SSOT 안정화)
 */

export interface UserProfile {
  id: number;
  username: string;
  avatar: string | null;
  email: string | null;
  created_at: Date;
  emailVerified: boolean;
  _count: {
    followers: number;
    following: number;
  };

  // viewer context
  isMe: boolean;
  isFollowing: boolean; // viewer → target (단건)
  viewerId?: number | null; // 클라 훅 초기화 등에 활용

  // @deprecated: 목록은 fetchFollowers/fetchFollowing에서 on-demand로 조회
  // followers?: { follower: { id: number; username: string; avatar: string | null } }[];
  // following?: { following: { id: number; username: string; avatar: string | null } }[];
}

// 팔로우 모달/리스트 전용 타입
export type FollowListUser = {
  id: number;
  username: string;
  avatar: string | null;

  // 버튼(토글) SSOT: viewer -> rowUser
  isFollowedByViewer: boolean;

  /**
   * 섹션 분리용(SSOT): owner 기준 맞팔 여부 (필수)
   * - followers 모달: owner가 rowUser를 팔로우하면 true (owner -> rowUser)
   * - following 모달: rowUser가 owner를 팔로우하면 true (rowUser -> owner)
   */
  isMutualWithOwner: boolean;
};

export type FollowListCursor = { lastId: number } | null;

// 평균 평점
export interface ProfileAverageRating {
  averageRating: number; // 0~5
  reviewCount: number;
}

// 배지
export type Badge = {
  id: number;
  name: string;
  icon: string;
  description: string;
};

// 리뷰 리스트 아이템
export interface ProfileReview {
  id: number;
  rate: number;
  payload?: string | null;
  created_at: Date; // created_at desc, id desc (키셋)
  user?: {
    id: number;
    username: string;
    avatar: string | null;
  };
  product: {
    id: number;
    title: string;
  };
}
