/**
 * File Name : lib/utils
 * Description : 공통 유틸리티 함수들 (클라이언트/서버 공용)
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2024.10.14  임도헌   Created
 * 2024.10.14  임도헌   Modified   제품 관련 함수 추가
 * 2024.11.23  임도헌   Modified   시간 포맷 수정(일,주,달 기준)
 * 2024.12.11  임도헌   Modified   시간 포맷 수정(한국 시간대 기준)
 * 2024.12.23  임도헌   Modified   뱃지 관련 함수 추가
 * 2025.03.29  임도헌   Modified   커뮤니티 기여도 함수명 및 로직 변경(isPopularity)
 * 2025.04.18  임도헌   Modified   구성품 관리자 뱃지를 품질의 달인 뱃지로 변경
 * 2025.05.29  임도헌   Modified   cn 유틸(tailwind-merge, clsx 기능 조합)
 * 2025.11.29  임도헌   Modified   DB 의존 함수 분리(Prisma 7 빌드 이슈 대응)
 * 2025.11.29  임도헌   Modified   formatToTimeAgo 로직 변경(nowInput 추가)
 */

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// clsx → 조건부 클래스 생성
// twMerge → Tailwind 클래스 병합
export const cn = (...inputs: ClassValue[]): string => twMerge(clsx(...inputs));

/**
 * 제공된 시간에 따라 "몇일 전/몇분 전" 등으로 표현하는 함수 (한국 시간 기준)
 * @param date   ISO 문자열 등 파싱 가능한 날짜 문자열
 * @param nowInput  기준 시각(ms). 없으면 현재 시각 기준
 */
export const formatToTimeAgo = (date: string, nowInput?: number): string => {
  // 한국 시간대로 변환 (대상 시각)
  const koreaTime = new Date(date).toLocaleString("en-US", {
    timeZone: "Asia/Seoul",
  });
  const time = new Date(koreaTime).getTime();

  // 기준 시각(now)도 한국 시간대로 변환
  const nowKoreaString =
    nowInput !== undefined
      ? new Date(nowInput).toLocaleString("en-US", { timeZone: "Asia/Seoul" })
      : new Date().toLocaleString("en-US", { timeZone: "Asia/Seoul" });

  const nowTime = new Date(nowKoreaString).getTime();

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

// 가격 "원" 포맷 (3자리 콤마)
export const formatToWon = (price: number): string => {
  return price.toLocaleString("ko-KR");
};

// 뱃지 한글 이름 가져오기
export function getBadgeKoreanName(badgeType: string): string {
  const koreanNames: { [key: string]: string } = {
    // 1. 거래 관련 뱃지
    FIRST_DEAL: "첫 거래 선원",
    POWER_SELLER: "노련한 상인",
    QUICK_RESPONSE: "신속한 교신병",

    // 2. 커뮤니티 활동 뱃지
    FIRST_POST: "첫 항해일지",
    POPULAR_WRITER: "인기 항해사",
    ACTIVE_COMMENTER: "열정적인 통신사",
    RULE_SAGE: "규칙의 현자",

    // 3. 보드게임 전문성 뱃지
    GAME_COLLECTOR: "보물선 수집가",
    GENRE_MASTER: "장르의 항해사",
    BOARD_EXPLORER: "보드게임 탐험가",

    // 4. 신뢰도 뱃지
    VERIFIED_SAILOR: "인증된 선원",
    FAIR_TRADER: "정직한 상인",
    QUALITY_MASTER: "품질의 달인",

    // 5. 특별 이벤트 뱃지
    EARLY_SAILOR: "첫 항해 선원",
    PORT_FESTIVAL: "항구 축제의 주인",
  };

  return koreanNames[badgeType] || badgeType;
}

// 초 단위 영상 시간을 "분 초" 문자열로 변환
export const formatDuration = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}분 ${s}초`;
};
