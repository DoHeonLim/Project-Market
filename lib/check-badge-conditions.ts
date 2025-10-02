/**
File Name : lib/check-badge-conditions
Description : 뱃지 조건 체크 및 부여 함수
Author : 임도헌

History
Date        Author   Status    Description
2024.12.23  임도헌   Created
2024.12.24  임도헌   Modified  뱃지 체크 조건 함수 추가
2025.01.12  임도헌   Modified  뱃지 획득시 이미지 보이게 변경
2025.03.02  임도헌   Modified  checkRuleSageBadge를 onPostCreate에서 제거
2025.03.29  임도헌   Modified  checkBoardExplorer함수 로직 변경
2025.04.10  임도헌   Modified  인증된 선원 뱃지 간소화
2025.04.13  임도헌   Modified  구성품 관리자를 품질의 달인으로 변경, 조건 수정
*/

import db from "@/lib/db";
import {
  calculateAverageRating,
  calculateCategoryRating,
  calculateChatResponseRate,
  getBadgeKoreanName,
  isPopularity,
} from "./utils";
import { supabase } from "./supabase";
import { sendPushNotification } from "./push-notification";

/**
 * 뱃지 부여 함수
 * - 새로운 뱃지 획득 시 사용자에게 부여하고 알림을 생성
 * - 이미 보유한 뱃지는 중복 부여하지 않음
 *
 * @param userId 사용자 ID
 * @param badgeName 뱃지 이름
 */
async function awardBadge(userId: number, badgeName: string) {
  try {
    // 이미 해당 뱃지를 가지고 있는지 체크
    const existingBadge = await db.badge.findFirst({
      where: {
        name: badgeName,
        users: {
          some: {
            id: userId,
          },
        },
      },
    });

    // 새로운 뱃지인 경우에만 부여
    if (!existingBadge) {
      const badge = await db.badge.findFirst({
        where: {
          name: badgeName,
        },
      });

      // 유저와 뱃지 연결
      await db.user.update({
        where: {
          id: userId,
        },
        data: {
          badges: {
            connect: {
              id: badge?.id,
            },
          },
        },
      });

      // 알림 생성
      const notification = await db.notification.create({
        data: {
          userId,
          title: "새로운 뱃지 획득!",
          body: `축하합니다! "${getBadgeKoreanName(
            badgeName
          )}" 뱃지를 획득하셨습니다!`,
          type: "BADGE",
          link: "/profile",
          image: `${badge?.icon}/public`,
          isPushSent: false,
        },
      });

      // 실시간 알림 전송
      await Promise.all([
        // Supabase 실시간 알림
        supabase.channel("notifications").send({
          type: "broadcast",
          event: "notification",
          payload: notification,
        }),
        // 푸시 알림 전송
        sendPushNotification({
          targetUserId: userId,
          title: notification.title,
          message: notification.body,
          url: notification.link || "", // 프로필 페이지로 이동
          type: "BADGE",
          image: notification.image || "",
        }).then(async (result) => {
          if (result.success) {
            await db.notification.update({
              where: { id: notification.id },
              data: { isPushSent: true, sentAt: new Date() },
            });
          }
        }),
      ]);
    }
  } catch (error) {
    console.error(`${badgeName} 뱃지 부여 중 오류:`, error);
  }
}

// 1. 거래 관련 뱃지들
/**
 * 첫 거래 선원 뱃지 체크 함수
 * - 조건: 첫 거래 완료 (판매 또는 구매)
 * - 호출 시점:
 *   1. 제품 거래가 완료될 때
 */
export const checkFirstDealBadge = async (userId: number) => {
  try {
    const tradeCount = await db.product.count({
      where: {
        OR: [
          { userId, purchase_userId: { not: null } },
          { purchase_userId: userId },
        ],
      },
    });

    // 첫 거래가 완료되었다면 뱃지 부여
    if (tradeCount === 1) {
      await awardBadge(userId, "FIRST_DEAL");
    }
  } catch (error) {
    console.error("FIRST_DEAL 뱃지 체크 중 오류:", error);
  }
};

/**
 * 노련한 상인 뱃지 체크 함수
 * - 조건:
 *   1. 10회 이상 거래 완료
 *   2. 평균 평점 4.0 이상
 * - 호출 시점:
 *   1. 거래가 완료될 때
 *   2. 판매자 평가가 등록될 때
 */
export const checkPowerSellerBadge = async (userId: number) => {
  try {
    const [salesCount, averageRating] = await Promise.all([
      db.product.count({
        where: {
          userId,
          purchase_userId: { not: null },
        },
      }),
      calculateAverageRating(userId),
    ]);

    if (salesCount >= 10 && averageRating >= 4.0) {
      await awardBadge(userId, "POWER_SELLER");
    }
  } catch (error) {
    console.error("POWER_SELLER 뱃지 체크 중 오류:", error);
  }
};

/**
 * 신속한 교신병 뱃지 체크 함수
 * - 조건:
 *   1. 채팅 메시지 100개 이상
 *   2. 채팅 응답률 90% 이상
 *   3. 평균 응답 시간 30분 이내
 * - 호출 시점:
 *   1. 채팅 메시지 응답 시
 *   2. 주기적인 채팅 통계 업데이트 시
 */
export const checkQuickResponseBadge = async (userId: number) => {
  try {
    const chatResponses = await calculateChatResponseRate(userId);
    if (
      chatResponses.totalMessages >= 100 &&
      chatResponses.rate >= 90 &&
      chatResponses.averageTime <= 30
    ) {
      await awardBadge(userId, "QUICK_RESPONSE");
    }
  } catch (error) {
    console.error("QUICK_RESPONSE 뱃지 체크 중 오류:", error);
  }
};

// 2. 커뮤니티 활동 뱃지들
/**
 * 첫 항해일지 뱃지 체크 함수
 * - 조건: 첫 게시글 작성
 * - 호출 시점:
 *   1. 게시글 작성 완료 시
 */
export const checkFirstPostBadge = async (userId: number) => {
  try {
    const postCount = await db.post.count({ where: { userId } });
    if (postCount >= 1) {
      await awardBadge(userId, "FIRST_POST");
    }
  } catch (error) {
    console.error("FIRST_POST 뱃지 체크 중 오류:", error);
  }
};

/**
 * 인기 항해사 뱃지 체크 함수
 * - 조건:
 *   1. 게시글 5개 이상
 *   2. 총 좋아요 100개 이상
 * - 호출 시점:
 *   1. 게시글 작성 시
 *   2. 게시글에 좋아요가 추가될 때
 */
export const checkPopularWriterBadge = async (userId: number) => {
  try {
    const posts = await db.post.findMany({
      where: { userId },
      include: { post_likes: true },
    });

    const totalLikes = posts.reduce(
      (sum, post) => sum + post.post_likes.length,
      0
    );
    if (posts.length >= 5 && totalLikes >= 100) {
      await awardBadge(userId, "POPULAR_WRITER");
    }
  } catch (error) {
    console.error("POPULAR_WRITER 뱃지 체크 중 오류:", error);
  }
};

/**
 * 열정적인 통신사 뱃지 체크 함수
 * - 조건:
 *   1. 최근 30일 내 댓글 50개 이상
 *   2. 규칙/후기 게시글 댓글 비율 30% 이상
 * - 호출 시점:
 *   1. 댓글 작성 시
 */
export const checkActiveCommenterBadge = async (userId: number) => {
  try {
    const comments = await db.comment.findMany({
      where: {
        userId,
        created_at: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      },
      include: { post: true },
    });

    const helpfulComments = comments.filter(
      (comment) =>
        comment.post.category === "MAP" || comment.post.category === "LOG"
    );

    if (
      comments.length >= 50 &&
      helpfulComments.length / comments.length >= 0.3
    ) {
      await awardBadge(userId, "ACTIVE_COMMENTER");
    }
  } catch (error) {
    console.error("ACTIVE_COMMENTER 뱃지 체크 중 오류:", error);
  }
};

/**
 * 규칙의 현자 뱃지 체크 함수
 * - 조건:
 *   1. 규칙 설명 게시글 10개 이상
 *   2. 규칙 설명 게시글의 총 조회수 500회 이상
 * - 호출 시점:
 *   1. 규칙 설명 게시글 작성 시
 *   2. 게시글 조회수 업데이트 시
 */
export const checkRuleSageBadge = async (userId: number) => {
  try {
    const rulePosts = await db.post.findMany({
      where: {
        userId,
        category: "MAP",
      },
    });

    if (rulePosts.length >= 10) {
      const totalViews = rulePosts.reduce((sum, post) => sum + post.views, 0);
      if (totalViews >= 500) {
        await awardBadge(userId, "RULE_SAGE");
      }
    }
  } catch (error) {
    console.error("RULE_SAGE 뱃지 체크 중 오류:", error);
  }
};

// 3. 보드게임 전문성 뱃지
/**
 * 보물선 수집가 뱃지 체크 함수
 * - 조건:
 *   1. 10개 이상의 서로 다른 게임 거래
 *   2. 3개 이상의 서로 다른 카테고리
 * - 호출 시점:
 *   1. 거래 완료 시 (조건 1)
 *   2. 제품 등록 시 (조건 2)
 */
export const checkGameCollectorBadge = async (userId: number) => {
  try {
    const trades = await db.product.findMany({
      where: {
        OR: [{ userId }, { purchase_userId: userId }],
      },
      include: { category: true },
      distinct: ["title"], //FIX요망. title로는 중복되는 게임 명 구분이 불가능 할 것으로 보임(product 테이블에 game_name 추가 필요)
    });

    const uniqueCategories = new Set(trades.map((trade) => trade.categoryId));
    if (trades.length >= 10 && uniqueCategories.size >= 3) {
      await awardBadge(userId, "GAME_COLLECTOR");
    }
  } catch (error) {
    console.error("GAME_COLLECTOR 뱃지 체크 중 오류:", error);
  }
};

/**
 * 장르의 항해사 뱃지 체크 함수
 * - 조건:
 *   1. 특정 카테고리에서 15회 이상 구매 또는 거래
 *   2. 해당 카테고리 평점 4.5 이상
 * - 호출 시점:
 *   1. 거래 완료 시(조건 1)
 *   2. 평가 등록 시(조건 2)
 *
 *   2025-03-29 : 코드 수정(오류 Fix)
 *
 *  현재 trades를 불러 올 때 판매 완료된 제품만 카운트 해야되는데 판매되지 않은 제품도 포함되어 있음.
 *  userId와 purchase_userId가 not null인 제품을 가져와야 됨.
 */
export const checkGenreMasterBadge = async (userId: number) => {
  try {
    // 사용자가 판매자이고 판매가 완료된 제품 또는 구매자인 제품 조회
    const trades = await db.product.findMany({
      where: {
        OR: [
          {
            userId,
            purchase_userId: { not: null }, // 판매가 완료된 제품만
          },
          { purchase_userId: userId }, // 사용자가 구매한 제품
        ],
      },
      include: { category: true },
    });

    // 카테고리별 거래 횟수 계산
    const categoryCounts = trades.reduce(
      (acc, trade) => {
        const categoryId = trade.categoryId;
        acc[categoryId] = (acc[categoryId] || 0) + 1;
        return acc;
      },
      {} as { [key: number]: number }
    );

    // 각 카테고리별로 조건 체크
    for (const [categoryIdStr, count] of Object.entries(categoryCounts)) {
      // 특정 카테고리에서 15회 이상 거래한 경우
      if (count >= 15) {
        const categoryId = Number(categoryIdStr);
        const categoryRating = await calculateCategoryRating(
          userId,
          categoryId
        );
        if (categoryRating >= 4.5) {
          await awardBadge(userId, "GENRE_MASTER");
          break;
        }
      }
    }
  } catch (error) {
    console.error("GENRE_MASTER 뱃지 체크 중 오류:", error);
  }
};

/**
 * 보드게임 탐험가 뱃지 체크 함수
 * - 조건:
 *   1. 5가지 이상의 게임 타입 거래
 *   2. 보물지도(공략), 항해 일지(후기) 게시글 10개 이상
 *   3. 커뮤니티 인기도 체크(댓글 20개 AND 좋아요 50개)
 * - 호출 시점:
 *   1. 거래 완료 시(조건 1)
 *   2. 후기(보물지도/MAP 및 항해 일지/LOG) 작성 시(조건 2)
 *   3. 평가 등록 시(조건 3) - 좋아요, 댓글
 */
export const checkBoardExplorerBadge = async (userId: number) => {
  try {
    const [trades, reviews, isPopularityUser] = await Promise.all([
      // 유저가 거래한 제품
      db.product.findMany({
        where: {
          OR: [
            {
              userId,
              purchase_userId: { not: null }, // 판매가 완료된 제품만
            },
            { purchase_userId: userId }, // 사용자가 구매한 제품
          ],
        },
        select: { game_type: true },
      }),
      // 게시글 수
      db.post.count({
        where: {
          userId,
          OR: [
            { category: "MAP" }, // 보물지도 (규칙 설명/공략)
            { category: "LOG" }, // 항해 일지 (게임 후기/리뷰)
          ],
        },
      }),
      // 활동성 평가
      isPopularity(userId),
    ]);

    const gameTypes = new Set(trades.map((trade) => trade.game_type));
    if (gameTypes.size >= 5 && reviews >= 10 && isPopularityUser == 1) {
      await awardBadge(userId, "BOARD_EXPLORER");
    }
  } catch (error) {
    console.error("BOARD_EXPLORER 뱃지 체크 중 오류:", error);
  }
};

// 4. 신뢰도 뱃지들
/**
 * 인증된 선원 뱃지 체크 함수
 * - 조건: 전화번호가 인증 됐을 때때
 * - 호출 시점:
 *   1. 전화번호 인증 완료 시
 * 전화번호 인증이 된 순간 함수를 불러와서 바로 뱃지 부여
 */
export const checkVerifiedSailorBadge = async (userId: number) => {
  try {
    await awardBadge(userId, "VERIFIED_SAILOR");
  } catch (error) {
    console.error("VERIFIED_SAILOR 뱃지 체크 중 오류:", error);
  }
};

/**
 * 공정한 거래자 뱃지 체크 함수
 * - 조건:
 *   1. 5회 이상 거래 완료
 *   2. 평균 평점 4.8 이상
 * - 설명: 정직한 거래로 높은 신뢰도를 쌓은 상인
 * - 호출 시점:
 *   1. 거래 완료 시(조건 1)
 *   2. 평가 등록 시(조건 2)
 */
export const checkFairTraderBadge = async (userId: number) => {
  try {
    const [completedTrades, averageRating] = await Promise.all([
      // 완료된 거래 수
      db.product.count({
        where: {
          OR: [
            {
              userId,
              purchase_userId: { not: null }, // 판매가 완료된 제품만
            },
            { purchase_userId: userId }, // 사용자가 구매한 제품
          ],
        },
      }),
      // 평균 평점
      calculateAverageRating(userId),
    ]);

    if (completedTrades >= 5 && averageRating >= 4.8) {
      await awardBadge(userId, "FAIR_TRADER");
    }
  } catch (error) {
    console.error("FAIR_TRADER 뱃지 체크 중 오류:", error);
  }
};

/**
 *  품질의 달인 체크 함수
 * - 조건:
 *   1. 5회 이상 판매 완료
 *   2. 80% 이상의 거래가 '새제품급' 또는 '거의 새것' 상태 (제품 상태)
 *   3. 80% 이상의 거래가 '완벽' 상태 (구성품 상태)
 * - 호출 시점:
 *   1. 거래 완료 시
 */
export const checkQualityMasterBadge = async (userId: number) => {
  try {
    const products = await db.product.findMany({
      where: {
        userId,
        purchase_userId: { not: null },
      },
      select: {
        condition: true,
        completeness: true,
      },
    });

    if (products.length >= 5) {
      const qualityProducts = products.filter(
        (product) =>
          (product.condition === "NEW" || product.condition === "LIKE_NEW") &&
          product.completeness === "COMPLETE"
      );

      if (qualityProducts.length / products.length >= 0.8) {
        await awardBadge(userId, "QUALITY_MASTER");
      }
    }
  } catch (error) {
    console.error("QUALITY_MASTER 뱃지 체크 중 오류:", error);
  }
};

// 5. 특별 이벤트 뱃지들
/**
 * 첫 항해 선원 뱃지 체크 함수
 * - 조건:
 *   1. 2025년 1월 1일 이전 가입
 *   2. 최소 1개 이상의 게시글 또는 댓글
 * - 호출 시점:
 *   1. 게시글 작성 시
 *   2. 댓글 작성 시
 */
export const checkEarlySailorBadge = async (userId: number) => {
  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        posts: true,
        comments: true,
      },
    });

    if (!user) return;

    const registrationDate = user.created_at;
    const earlyAdopterDate = new Date("2025-01-01");

    if (
      registrationDate < earlyAdopterDate &&
      (user.posts.length > 0 || user.comments.length > 0)
    ) {
      await awardBadge(userId, "EARLY_SAILOR");
    }
  } catch (error) {
    console.error("EARLY_SAILOR 뱃지 체크 중 오류:", error);
  }
};

/**
 * 항구 축제 뱃지 체크 함수
 * - 조건: 최근 30일 내 (vercel의 cron을 사용해야 되나?)
 *   1. 게시글 3개 이상
 *   2. 댓글 10개 이상
 *   3. 거래 1회 이상
 * - 호출 시점:
 *   1. 게시글/댓글 작성 시
 *   2. 거래 완료 시
 *   3. 정기적인 뱃지 체크 시 (30일 기준)
 */
export const checkPortFestivalBadge = async (userId: number) => {
  try {
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    const activity = await db.user.findUnique({
      where: { id: userId },
      include: {
        posts: {
          where: { created_at: { gte: lastMonth } },
        },
        comments: {
          where: { created_at: { gte: lastMonth } },
        },
        products: {
          where: {
            AND: [
              { created_at: { gte: lastMonth } },
              { purchase_userId: { not: null } },
            ],
          },
        },
      },
    });

    if (
      activity &&
      activity.posts.length >= 3 &&
      activity.comments.length >= 10 &&
      activity.products.length >= 1
    ) {
      await awardBadge(userId, "PORT_FESTIVAL");
    }
  } catch (error) {
    console.error("PORT_FESTIVAL 뱃지 체크 중 오류:", error);
  }
};

// 액션별 체크 함수 그룹화
export const badgeChecks = {
  // 1. 거래 완료시 체크
  onTradeComplete: async (userId: number) => {
    await Promise.all([
      checkFirstDealBadge(userId),
      checkPowerSellerBadge(userId),
      checkGameCollectorBadge(userId),
      checkGenreMasterBadge(userId),
      checkQualityMasterBadge(userId),
      checkFairTraderBadge(userId),
    ]);
  },

  // 2. 게시글 작성시 체크
  onPostCreate: async (userId: number) => {
    await Promise.all([
      checkFirstPostBadge(userId),
      checkPopularWriterBadge(userId),
      checkPortFestivalBadge(userId),
    ]);
  },

  // 3. 댓글 작성시 체크
  onCommentCreate: async (userId: number) => {
    await Promise.all([
      checkActiveCommenterBadge(userId),
      checkPortFestivalBadge(userId),
      checkBoardExplorerBadge(userId),
    ]);
  },

  // 4. 채팅 응답시 체크
  onChatResponse: async (userId: number) => {
    await checkQuickResponseBadge(userId);
  },

  // 5. 제품 등록시 체크
  onProductAdd: async (userId: number) => {
    await Promise.all([
      checkGameCollectorBadge(userId),
      checkGenreMasterBadge(userId),
    ]);
  },

  // 6. 인증 정보 업데이트시 체크
  onVerificationUpdate: async (userId: number) => {
    await checkVerifiedSailorBadge(userId);
  },

  // 7. 이벤트 참여시 체크
  onEventParticipation: async (userId: number) => {
    await Promise.all([
      checkEarlySailorBadge(userId),
      checkPortFestivalBadge(userId),
    ]);
  },
};

// 전체 뱃지 체크 (필요한 경우에만 사용)
export async function checkAllBadges(userId: number) {
  await Promise.all([
    checkFirstDealBadge(userId),
    checkPowerSellerBadge(userId),
    checkQuickResponseBadge(userId),
    checkFirstPostBadge(userId),
    checkPopularWriterBadge(userId),
    checkActiveCommenterBadge(userId),
    checkRuleSageBadge(userId),
    checkGameCollectorBadge(userId),
    checkGenreMasterBadge(userId),
    checkBoardExplorerBadge(userId),
    checkVerifiedSailorBadge(userId),
    checkQualityMasterBadge(userId),
    checkFairTraderBadge(userId),
    checkEarlySailorBadge(userId),
    checkPortFestivalBadge(userId),
  ]);
}
