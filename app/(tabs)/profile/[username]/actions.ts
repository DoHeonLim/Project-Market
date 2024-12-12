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
*/

"use server";

import db from "@/lib/db";
import getSession from "@/lib/session";
import { notFound, redirect } from "next/navigation";

// 유저 프로필 제공 함수
export const getUserProfile = async (username: string) => {
  // 한글 디코딩
  const decodedUsername = decodeURIComponent(username);

  const user = await db.user.findUnique({
    where: { username: decodedUsername },
    select: {
      id: true,
      username: true,
      avatar: true,
      created_at: true,
      reviews: {
        select: {
          id: true,
          payload: true,
          rate: true,
          user: {
            select: {
              username: true,
              avatar: true,
            },
          },
        },
      },
    },
  });
  // 유저 없으면 404 에러
  if (!user) notFound();
  // 유저 본인이면 본인 프로필로 이동하기 위해서 session 정보 가져오기
  const session = await getSession();
  //   유저 본인이면 본인 프로필로 이동하기 위해서 session 정보 가져오기
  if (session.id === user.id) {
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
      id: true,
      title: true,
      price: true,
      images: {
        select: {
          url: true,
        },
        orderBy: {
          order: "asc",
        },
        take: 1,
      },
      created_at: true,
      reservation_userId: true,
      purchase_userId: true,
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
      id: true,
      title: true,
      price: true,
      images: {
        select: {
          url: true,
        },
        orderBy: {
          order: "asc",
        },
        take: 1,
      },
      created_at: true,
      reservation_userId: true,
      purchase_userId: true,
    },
    orderBy: {
      created_at: "desc",
    },
    take,
    skip,
  });
  console.log(products);

  return products;
};
