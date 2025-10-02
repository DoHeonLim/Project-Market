/**
File Name : app/(tabs)/profile/[usernmae]/actions
Description : 유저 프로필 페이지 액션
Author : 임도헌

History
Date        Author   Status    Description
2024.12.07  임도헌   Created
2024.12.07  임도헌   Modified  유저 프로필 페이지 액션 추가
2024.12.07  임도헌   Modified  유저 프로필 제공 함수 추가
2024.12.07  임도헌   Modified  유저 초기 제품 제공 함수 추가
2024.12.07  임도헌   Modified  유저 제품 무한 스크롤 함수 추가
2024.12.07  임도헌   Modified  getUserProfile에 평균 평점 및 갯수 삭제
2024.12.12  임도헌   Modified  제품 대표 사진 하나 들고오기
2024.12.22  임도헌   Modified  제품 모델 변경에 따른 리턴값 변경
2025.05.23  임도헌   Modified  getUserProfile함수 수정(프로필 페이지일 경우만 본인 프로필로 이동)
*/

"use server";

import db from "@/lib/db";
import getSession from "@/lib/session";
import { notFound, redirect } from "next/navigation";

// 유저 프로필 제공 함수
export const getUserProfile = async (
  username: string,
  isprofilepage: boolean
) => {
  // 한글 디코딩
  const decodedUsername = decodeURIComponent(username);

  const user = await db.user.findUnique({
    where: { username: decodedUsername },
    select: {
      id: true,
      username: true,
      avatar: true,
      created_at: true,
      _count: { select: { followers: true, following: true } },
      followers: {
        select: {
          follower: { select: { id: true, username: true, avatar: true } },
        },
      },
      following: {
        select: {
          following: { select: { id: true, username: true, avatar: true } },
        },
      },
      reviews: {
        select: {
          id: true,
          payload: true,
          rate: true,
          user: { select: { username: true, avatar: true } },
        },
      },
    },
  });
  // 유저 없으면 404 에러
  if (!user) notFound();
  // 유저 본인이면 본인 프로필로 이동하기 위해서 session 정보 가져오기
  const session = await getSession();
  //   유저 본인이면 본인 프로필로 이동하기 위해서 session 정보 가져오기
  if (isprofilepage && session.id === user.id) {
    redirect("/profile");
  }

  return user;
};

export const getUserProducts = async (
  userId: number,
  status: "selling" | "sold"
) => {
  const take = 4;
  const products = await db.product.findMany({
    where: {
      userId,
      purchase_userId: status === "sold" ? { not: null } : null,
    },
    select: {
      title: true,
      price: true,
      created_at: true,
      images: {
        where: { order: 0 },
        take: 1,
        select: {
          url: true,
        },
      },
      id: true,
      views: true,
      reservation_userId: true,
      purchase_userId: true,
      category: {
        select: {
          kor_name: true,
          icon: true,
          parent: {
            select: {
              kor_name: true,
              icon: true,
            },
          },
        },
      },
      game_type: true,
      _count: {
        select: {
          product_likes: true,
        },
      },
      search_tags: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      created_at: "desc",
    },
    take,
  });
  return products;
};

export const getMoreUserProducts = async (
  userId: number,
  status: "selling" | "sold",
  page: number
) => {
  const take = 4;
  const skip = page * take;

  const products = await db.product.findMany({
    where: {
      userId,
      purchase_userId: status === "sold" ? { not: null } : null,
    },
    select: {
      title: true,
      price: true,
      created_at: true,
      images: {
        where: { order: 0 },
        take: 1,
        select: {
          url: true,
        },
      },
      id: true,
      views: true,
      reservation_userId: true,
      purchase_userId: true,
      category: {
        select: {
          kor_name: true,
          icon: true,
          parent: {
            select: {
              kor_name: true,
              icon: true,
            },
          },
        },
      },
      game_type: true,
      _count: {
        select: {
          product_likes: true,
        },
      },
      search_tags: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      created_at: "desc",
    },
    take,
    skip,
  });

  return products;
};

/** viewer가 channel owner를 팔로우 중인지 확인 */
export async function getIsFollowing(
  followerId: number,
  followingId: number
): Promise<boolean> {
  if (!followerId || !followingId) return false;
  if (followerId === followingId) return true; // 자기 자신은 true로 처리(UX 단순화)
  const follow = await db.follow.findUnique({
    where: { followerId_followingId: { followerId, followingId } },
    select: { followerId: true },
  });
  return !!follow;
}
