/**
File Name : lib/session
Description : 기타 함수들
Author : 임도헌

History
Date        Author   Status    Description
2024.10.14  임도헌   Created
2024.10.14  임도헌   Modified   제품 관련 함수 추가
*/

// 제공된 시간에 따라 몇일 전에 올렸는지 한국 기준으로 변경하는 함수
export const formatToTimeAgo = (date: string): string => {
  // 하루 동안의 밀리초
  const dayInMs = 1000 * 60 * 60 * 24;
  const time = new Date(date).getTime();
  const now = new Date().getTime();
  const diffTime = Math.round((time - now) / dayInMs);

  const formatter = new Intl.RelativeTimeFormat("ko");
  return formatter.format(diffTime, "days");
};

// 가격 "원"으로 변경
export const formatToWon = (price: number): string => {
  return price.toLocaleString("ko-KR");
};
