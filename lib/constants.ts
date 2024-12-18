/**
File Name : lib/constants
Description : 상수 파일
Author : 임도헌

History
Date        Author   Status    Description
2024.10.04  임도헌   Created
2024.10.04  임도헌   Modified  패스워드 관련 상수 추가
2024.10.17  임도헌   Modified  이미지 최대 크기 상수 추가
2024.12.10  임도헌   Modified  이미지 스켈레톤 상수 추가
*/

// 패스워드 최소 값
export const PASSWORD_MIN_LENGTH = 4;

// 패스워드 정규표현식 체크
export const PASSWORD_REGEX = new RegExp(
  /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).+$/
);
// 패스워드 정규표현식 에러 메시지
export const PASSWORD_REGEX_ERROR =
  "비밀번호는 소문자, 대문자, 숫자, 특수문자를 포함해야 합니다.";

// 이미지 최대 크기
export const MAX_PHOTO_SIZE = 3 * 1024 * 1024;

// base64로 인코딩된 이미지 픽셀(1*1) - #d0d0d0색상
export const BLUR_DATA_URL =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mO8UA8AAiUBUcc3qzwAAAAASUVORK5CYII=";

// 게시글 카테고리
export const POST_CATEGORY = {
  Free: "자유", //자유
  CREW: "모험대원 모집", // 게임 모임/파티 모집
  LOG: "항해 일지", // 게임 후기/리뷰
  MAP: "보물지도", // 게임 규칙/공략
  COMPASS: "나침반", // 질문과 답변
} as const;

// 제품 필터 타입
export type FilterState = {
  category: string;
  minPrice: string;
  maxPrice: string;
  game_type: string;
  condition: string;
};

// 게시글 카테고리 타입
export type PostCategory = keyof typeof POST_CATEGORY;
