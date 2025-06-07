/**
 File Name : app/(tabs)/products/actions/history
 Description : 검색 기록 저장/업데이트
 Author : 임도헌
 
 History
 Date        Author   Status    Description
 2025.05.29  임도헌   Created
 2025.05.29  임도헌   Modified  app/(tabs)/products/actions.ts 파일을 기능별로 분리
 2025.05.29  임도헌   Modified  검색 기록 저장/업데이트 기능 분리
 */
"use server";

import db from "@/lib/db";
import getSession from "@/lib/session";

interface SearchData {
  keyword: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  game_type?: string;
  condition?: string;
}

// 검색 기록 저장
export const saveSearchHistory = async (
  userId: number,
  searchData: SearchData
) => {
  const existingSearch = await db.searchHistory.findFirst({
    where: {
      userId,
      keyword: searchData.keyword,
    },
  });

  if (existingSearch) {
    await db.searchHistory.update({
      where: { id: existingSearch.id },
      data: { updated_at: new Date() },
    });
  } else {
    await db.searchHistory.create({
      data: {
        userId,
        ...searchData,
      },
    });
  }
};

// 최근 검색 기록
export const getUserSearchHistory = async () => {
  const session = await getSession();
  if (!session.id) return [];

  return db.searchHistory.findMany({
    where: { userId: session.id },
    select: { keyword: true, created_at: true },
    orderBy: { updated_at: "desc" },
    take: 5,
  });
};

// 인기 검색어
export const getPopularSearches = async () => {
  return db.popularSearch.findMany({
    select: { keyword: true, count: true },
    orderBy: { count: "desc" },
    take: 5,
  });
};

// 특정 검색어 삭제
export const deleteSearchHistory = async (keyword: string) => {
  const session = await getSession();
  if (!session.id) return;

  await db.searchHistory.deleteMany({
    where: { userId: session.id, keyword },
  });
};

// 전체 삭제
export const deleteAllSearchHistory = async () => {
  const session = await getSession();
  if (!session.id) return;

  await db.searchHistory.deleteMany({ where: { userId: session.id } });
};
