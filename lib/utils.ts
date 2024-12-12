/**
File Name : lib/session
Description : 기타 함수들
Author : 임도헌

History
Date        Author   Status    Description
2024.10.14  임도헌   Created
2024.10.14  임도헌   Modified   제품 관련 함수 추가
2024.11.23  임도헌   Modified   시간 포맷 수정(일,주,달 기준)
2024.12.11  임도헌   Modified   시간 포맷 수정(한국 시간대 기준)
*/

// 제공된 시간에 따라 몇일 전에 올렸는지 한국 기준으로 변경하는 함수
export const formatToTimeAgo = (date: string): string => {
  // 한국 시간대로 변환
  const koreaTime = new Date(date).toLocaleString("en-US", {
    timeZone: "Asia/Seoul",
  });
  const time = new Date(koreaTime).getTime();
  const now = new Date().toLocaleString("en-US", { timeZone: "Asia/Seoul" });
  const nowTime = new Date(now).getTime();

  const diffTime = nowTime - time;
  const dayInMs = 1000 * 60 * 60 * 24;
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
    const koreaDate = new Date(koreaTime);
    const formattedHours = koreaDate.getHours();
    const amPm = formattedHours >= 12 ? "오후" : "오전";
    const hours = formattedHours % 12 || 12;
    const minutes = koreaDate.getMinutes();
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
