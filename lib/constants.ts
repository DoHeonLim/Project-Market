/**
File Name : lib/constants
Description : 상수 파일
Author : 임도헌

History
Date        Author   Status    Description
2024.10.04  임도헌   Created
2024.10.04  임도헌   Modified  패스워드 관련 상수 추가
2024.10.17  임도헌   Modified  이미지 최대 크기 상수 추가
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
