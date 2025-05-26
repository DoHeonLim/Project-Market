/**
File Name : app/(tabs)/profile/action
Description : 프로필 서버 코드
Author : 임도헌

History
Date        Author   Status    Description
2024.11.25  임도헌   Created
2024.11.25  임도헌   Modified  프로필 수정 코드 추가
2024.11.28  임도헌   Modified  프로필 수정 코드 완성
2025.05.23  임도헌   Modified  getUser에 follow 값 가져오도록 변경
*/
"use server";

import bcrypt from "bcrypt";
import db from "@/lib/db";
import getSession from "@/lib/session";
import { notFound, redirect } from "next/navigation";
import { passwordUpdateSchema } from "./schema";

// 유저 프로필 정보 반환
export const getUser = async () => {
  const session = await getSession();
  if (!session.id) {
    notFound();
  } else {
    const user = await db.user.findUnique({
      where: {
        id: session.id,
      },
      select: {
        id: true,
        username: true,
        password: true,
        avatar: true,
        email: true,
        github_id: true,
        phone: true,
        created_at: true,
        updated_at: true,
        emailVerified: true,
        _count: {
          select: {
            followers: true,
            following: true,
          },
        },
        followers: {
          select: {
            follower: {
              select: {
                id: true,
                username: true,
                avatar: true,
              },
            },
          },
        },
        following: {
          select: {
            following: {
              select: {
                id: true,
                username: true,
                avatar: true,
              },
            },
          },
        },
      },
    });
    if (!user) {
      notFound();
    }
    return user;
  }
};

// 유저 전체 리뷰 찾아서 반환 (초기 5개만)
export const getInitialUserReviews = async (userId: number) => {
  const take = 5; // 초기 5개만 가져오기
  const reviews = await db.product.findMany({
    where: {
      userId,
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
        include: {
          user: {
            select: {
              username: true,
              avatar: true,
            },
          },
        },
      },
    },
    take,
  });

  return reviews.flatMap((product) => product.reviews);
};

// 유저 세션 삭제하고 로그아웃 처리
export const logOut = async () => {
  "use server";
  const session = await getSession();
  session.destroy();
  redirect("/");
};

type ChangePasswordResponse = {
  success: boolean;
  errors?: {
    currentPassword?: string[];
    password?: string[];
    confirmPassword?: string[];
  };
};

// 유저 패스워드 변경하는 함수
export const changePassword = async (
  FormData: FormData
): Promise<ChangePasswordResponse> => {
  // 폼 데이터 얻어오기
  const data = {
    currentPassword: FormData.get("currentPassword"),
    password: FormData.get("password"),
    confirmPassword: FormData.get("confirmPassword"),
  };

  // 유저 데이터 얻어오기
  const user = await getUser();

  const results = passwordUpdateSchema.safeParse(data);
  if (!results.success) {
    return {
      success: false,
      errors: results.error.flatten().fieldErrors,
    };
  } else {
    // 현재 비밀번호 맞는지 체크
    const isCheckCurrentPassword = await bcrypt.compare(
      results.data.currentPassword,
      user.password ?? ""
    );

    if (!isCheckCurrentPassword) {
      return {
        success: false,
        errors: {
          currentPassword: ["현재 비밀번호가 일치하지 않습니다."],
        },
      };
    } else {
      // 변경할 비밀번호 암호화
      const hashedPassword = await bcrypt.hash(results.data.password, 12);
      await db.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      });

      return { success: true };
    }
  }
};

export const getMoreUserReviews = async (page: number, userId?: number) => {
  if (!userId) {
    const session = await getSession();
    userId = session.id!;
  }
  const take = 5; // 한 번에 가져올 리뷰 수
  const skip = page * take;

  const reviews = await db.product.findMany({
    where: {
      userId,
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
        include: {
          user: {
            select: {
              username: true,
              avatar: true,
            },
          },
        },
      },
    },
    take,
    skip,
  });

  return reviews.flatMap((product) => product.reviews);
};

// 유저가 받은 리뷰들의 평균 별점 계산
export const getUserAverageRating = async (userId?: number) => {
  if (!userId) {
    const session = await getSession();
    userId = session.id!;
  }

  const reviews = await db.product.findMany({
    where: {
      userId,
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

  const allRatings = reviews.flatMap((product) =>
    product.reviews.map((r) => r.rate)
  );

  if (allRatings.length === 0) return null;

  const averageRating =
    allRatings.reduce((acc, curr) => acc + curr, 0) / allRatings.length;
  const totalReviews = allRatings.length;

  return {
    average: Number(averageRating.toFixed(1)),
    total: totalReviews,
  };
};

// 전체 뱃지 목록 가져오기
export async function getAllBadges() {
  try {
    const badges = await db.badge.findMany({
      select: {
        id: true,
        name: true,
        icon: true,
        description: true,
      },
    });
    return badges;
  } catch (error) {
    console.error("뱃지 목록 조회 중 오류:", error);
    return [];
  }
}

// 사용자가 획득한 뱃지 목록 가져오기
export async function getUserBadges(userId: number) {
  try {
    const userBadges = await db.user.findUnique({
      where: { id: userId },
      select: {
        badges: {
          select: {
            id: true,
            name: true,
            icon: true,
            description: true,
          },
        },
      },
    });
    return userBadges?.badges || [];
  } catch (error) {
    console.error("사용자 뱃지 조회 중 오류:", error);
    return [];
  }
}
