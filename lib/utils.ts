/**
File Name : lib/session
Description : 기타 함수들
Author : 임도헌

History
Date        Author   Status    Description
2024.10.14  임도헌   Created
2024.10.14  임도헌   Modified   제품 관련 함수 추가
2024.11.23  임도헌   Modified   시간 포맷 수정(일,주,달 기준)
*/

// 제공된 시간에 따라 몇일 전에 올렸는지 한국 기준으로 변경하는 함수
export const formatToTimeAgo = (date: string): string => {
  //하루동안의 밀리초
  const dayInMs = 1000 * 60 * 60 * 24;
  const time = new Date(date).getTime();
  const now = new Date().getTime();
  const diffTime = now - time;
  const diffInDays = Math.floor(diffTime / dayInMs);
  const diffInHours = Math.floor(diffTime / (1000 * 60 * 60));
  const diffInMinutes = Math.floor(diffTime / (1000 * 60));
  if (diffInDays > 0) {
    if (diffInDays >= 30) {
      const diffInMonths = Math.floor(diffInDays / 30);
      return `${diffInMonths}달 전`;
    } else if (diffInDays >= 7) {
      const diffInWeeks = Math.floor(diffInDays / 7);
      return `${diffInWeeks}주일 전`;
    } else {
      return `${diffInDays}일 전`;
    }
  } else if (diffInHours > 0) {
    const formattedHours = diffInHours % 24;
    const amPm = formattedHours >= 12 ? "오후" : "오전";
    const hours = formattedHours % 12 || 12;
    const minutes = new Date(date).getMinutes();
    return `${amPm} ${hours}시 ${minutes}분`;
  } else if (diffInMinutes > 0) {
    return `${diffInMinutes}분 전`;
  } else {
    return `방금 전`;
  }
};

// 가격 "원"으로 변경
export const formatToWon = (price: number): string => {
  return price.toLocaleString("ko-KR");
};
