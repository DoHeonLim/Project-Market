/**
 File Name : app/(tabs)/products/actions/history
 Description : 검색 기록 저장/업데이트
 Author : 임도헌
 
 History
 Date        Author   Status    Description
 2025.05.29  임도헌   Created
 2025.05.29  임도헌   Modified  app/(tabs)/products/actions.ts 파일을 기능별로 분리
 2025.05.29  임도헌   Modified  검색 기록 저장/업데이트 기능 분리
 2025.06.12  임도헌   Modified  타입 명시 추가
 */

"use server";

import db from "@/lib/db";
import getSession from "@/lib/session";

// 🔹 검색 필드 인터페이스
export interface SearchData {
  keyword: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  game_type?: string;
  condition?: string;
}

// 🔹 최근 검색 기록 반환 타입
export interface UserSearchHistoryItem {
  keyword: string;
  created_at: Date;
}

// 🔹 인기 검색어 반환 타입
export interface PopularSearchItem {
  keyword: string;
  count: number;
}

// 🔸 검색 기록 저장 (내부 로직)
export const saveSearchHistory = async (
  userId: number,
  searchData: SearchData
): Promise<void> => {
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

// 🔸 클라이언트 호출용: 세션에서 유저 ID 자동 처리
export const createSearchHistory = async (keyword: string): Promise<void> => {
  const session = await getSession();
  if (!session?.id) return;

  await saveSearchHistory(session.id, { keyword });
};

// 🔸 최근 검색 기록 가져오기
export const getUserSearchHistory = async (): Promise<
  UserSearchHistoryItem[]
> => {
  const session = await getSession();
  if (!session.id) return [];

  return db.searchHistory.findMany({
    where: { userId: session.id },
    select: { keyword: true, created_at: true },
    orderBy: { updated_at: "desc" },
    take: 5,
  });
};

// 🔸 인기 검색어 가져오기
export const getPopularSearches = async (): Promise<PopularSearchItem[]> => {
  return db.popularSearch.findMany({
    select: { keyword: true, count: true },
    orderBy: { count: "desc" },
    take: 5,
  });
};

// 🔸 특정 검색어 삭제
export const deleteSearchHistory = async (keyword: string): Promise<void> => {
  const session = await getSession();
  if (!session.id) return;

  await db.searchHistory.deleteMany({
    where: { userId: session.id, keyword },
  });
};

// 🔸 전체 검색어 삭제
export const deleteAllSearchHistory = async (): Promise<void> => {
  const session = await getSession();
  if (!session.id) return;

  await db.searchHistory.deleteMany({ where: { userId: session.id } });
};
