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
2024.12.23  임도헌   Modified   뱃지 관련 함수 추가
*/

import db from "./db";

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

// 평균 평점 계산 함수
// - 판매 완료된 제품의 리뷰 평점만 계산
// - 자신이 작성한 리뷰는 제외
export async function calculateAverageRating(userId: number): Promise<number> {
  const reviews = await db.product.findMany({
    where: {
      userId,
      purchase_userId: {
        not: null, // 판매 완료된 제품만
      },
    },
    select: {
      reviews: {
        where: {
          userId: {
            not: userId, // 자신이 작성한 리뷰는 제외
          },
        },
        select: {
          rate: true,
        },
      },
    },
  });
  //모든 리뷰 평점
  const allRatings = reviews.flatMap((product) =>
    product.reviews.map((r) => r.rate)
  );

  if (allRatings.length === 0) return 0;
  //평균 평점
  const averageRating =
    allRatings.reduce((acc, curr) => acc + curr, 0) / allRatings.length;

  return Number(averageRating.toFixed(1));
}

// 채팅 응답률 및 평균 응답 시간 계산 함수
// - 판매자/구매자로서의 모든 채팅 기록 분석
// - 응답률과 평균 응답 시간 계산
export async function calculateChatResponseRate(userId: number): Promise<{
  rate: number;
  averageTime: number;
  totalMessages: number;
}> {
  const chatRooms = await db.productChatRoom.findMany({
    where: {
      users: {
        some: {
          id: userId,
        },
      },
    },
    include: {
      product: {
        select: {
          userId: true,
        },
      },
      messages: {
        orderBy: {
          created_at: "asc",
        },
        select: {
          userId: true,
          created_at: true,
        },
      },
    },
  });

  //채팅 기록이 없는 경우
  if (chatRooms.length === 0) {
    return { rate: 0, averageTime: 0, totalMessages: 0 };
  }

  //응답 시간 총합
  let totalResponseTime = 0;
  //응답 횟수
  let responseCount = 0;
  //메시지 총합
  let totalMessages = 0;
  let userMessages = 0;

  //채팅 기록 분석
  chatRooms.forEach((room) => {
    const messages = room.messages;
    const isSeller = room.product.userId === userId;

    messages.forEach((message, i) => {
      if (message.userId === userId) {
        userMessages++;
      }

      if (i > 0) {
        const previousMessage = messages[i - 1];
        // 메시지 작성자가 다른 경우 (대화가 오갈 때)
        // 판매자인 경우에만 응답 시간을 계산
        if (
          isSeller &&
          message.userId === userId &&
          previousMessage.userId !== userId
        ) {
          const responseTime = Math.floor(
            (message.created_at.getTime() -
              previousMessage.created_at.getTime()) /
              (1000 * 60)
          ); // 분 단위로 변환
          totalResponseTime += responseTime;
          responseCount++;
        }
      }
      totalMessages++;
    });
  });
  //응답률
  const responseRate =
    totalMessages > 0 ? (responseCount / totalMessages) * 100 : 0;
  //평균 응답 시간
  const averageResponseTime =
    responseCount > 0 ? totalResponseTime / responseCount : 0;

  return {
    rate: responseRate,
    averageTime: averageResponseTime,
    totalMessages: userMessages,
  };
}

// 카테고리별 평균 평점 계산 함수
export async function calculateCategoryRating(
  userId: number,
  categoryId: number
): Promise<number> {
  const reviews = await db.product.findMany({
    where: {
      userId,
      category: {
        id: categoryId,
      },
      purchase_userId: {
        not: null,
      },
    },
    select: {
      reviews: {
        where: {
          userId: {
            not: userId,
          },
        },
        select: {
          rate: true,
        },
      },
    },
  });
  //모든 리뷰 평점
  const allRatings = reviews.flatMap((product) =>
    product.reviews.map((r) => r.rate)
  );
  //리뷰가 없는 경우
  if (allRatings.length === 0) return 0;
  //평균 평점
  const averageRating =
    allRatings.reduce((acc, curr) => acc + curr, 0) / allRatings.length;

  return Number(averageRating.toFixed(1));
}

// 커뮤니티 기여도 평점 계산 함수
// - 보물지도(MAP)와 항해일지(LOG) 카테고리의 게시글만 평가
// - 좋아요, 댓글, 조회수를 가중치를 적용하여 계산
export async function calculateCommunityRating(
  userId: number
): Promise<number> {
  const posts = await db.post.findMany({
    where: {
      userId,
      OR: [
        { category: "MAP" }, // 보물지도 (규칙 설명/공략)
        { category: "LOG" }, // 항해 일지 (게임 후기/리뷰)
      ],
    },
    include: {
      post_likes: true,
      comments: true,
    },
  });

  if (posts.length === 0) return 0;

  const rating =
    posts.reduce((sum, post) => {
      const postScore =
        post.post_likes.length * 0.5 + // 좋아요 가중치
        post.comments.length * 0.3 + // 댓글 가중치
        post.views * 0.01; // 조회수 가중치
      return sum + postScore;
    }, 0) / posts.length;

  return Math.min(rating, 5); // 최대 5점으로 제한
}

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
    COMPONENT_KEEPER: "구성품 관리자",

    // 5. 특별 이벤트 뱃지
    EARLY_SAILOR: "첫 항해 선원",
    PORT_FESTIVAL: "항구 축제의 주인",
  };

  return koreanNames[badgeType] || badgeType;
}
