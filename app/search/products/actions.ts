/**
File Name : app/search/products/actions.ts
Description : 제품 검색 서버 코드
Author : 임도헌

History
Date        Author   Status    Description
2024.12.17  임도헌   Created
2024.12.17  임도헌   Modified  제품 검색 서버 코드 추가
*/
"use server";

import db from "@/lib/db";
import getSession from "@/lib/session";

// 카테고리 가져오기
export const getCategories = async () => {
  const categories = await db.category.findMany({
    where: {
      parentId: null,
    },
    include: {
      children: {
        select: {
          id: true,
          name: true,
          icon: true,
        },
      },
    },
  });
  return categories;
};

// 검색 함수
interface SearchParams {
  keyword?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  game_type?: string;
  condition?: string;
  take?: number;
  skip?: number;
}

// 검색 기록 저장 또는 업데이트
const saveSearchHistory = async (
  userId: number,
  searchData: {
    keyword: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    game_type?: string;
    condition?: string;
  }
) => {
  // 기존 검색 기록 확인
  const existingSearch = await db.searchHistory.findFirst({
    where: {
      userId,
      keyword: searchData.keyword,
    },
  });

  if (existingSearch) {
    // 기존 검색 기록이 있으면 updated_at만 업데이트
    await db.searchHistory.update({
      where: {
        id: existingSearch.id,
      },
      data: {
        updated_at: new Date(),
      },
    });
  } else {
    // 새로운 검색 기록 생성
    await db.searchHistory.create({
      data: {
        userId,
        ...searchData,
      },
    });
  }
};

export const searchProducts = async ({
  keyword,
  category,
  minPrice,
  maxPrice,
  game_type,
  condition,
  take = 10,
  skip = 0,
}: SearchParams) => {
  // 먼저 선택된 카테고리가 부모 카테고리인지 확인
  let categoryCondition = {};
  if (category) {
    const selectedCategory = await db.category.findUnique({
      where: { id: parseInt(category) },
      include: {
        children: {
          select: { id: true },
        },
      },
    });

    if (selectedCategory) {
      if (selectedCategory.parentId === null) {
        // 부모 카테고리인 경우: 자신의 ID와 모든 자식 카테고리의 ID를 포함
        categoryCondition = {
          OR: [
            { categoryId: parseInt(category) },
            {
              categoryId: {
                in: selectedCategory.children.map((child) => child.id),
              },
            },
          ],
        };
      } else {
        // 자식 카테고리인 경우: 해당 카테고리 ID만 검색
        categoryCondition = { categoryId: parseInt(category) };
      }
    }
  }

  const where = {
    AND: [
      keyword
        ? {
            OR: [
              { title: { contains: keyword } },
              { description: { contains: keyword } },
              { search_tags: { some: { name: { contains: keyword } } } },
            ],
          }
        : {},
      categoryCondition,
      {
        price: {
          gte: minPrice,
          lte: maxPrice,
        },
      },
      game_type ? { game_type } : {},
      condition ? { condition } : {},
    ],
  };

  const products = await db.product.findMany({
    where,
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
          name: true,
          icon: true,
          parent: {
            select: {
              name: true,
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

  // 검색 기록 저장
  if (keyword) {
    const session = await getSession();
    if (session.id) {
      await saveSearchHistory(session.id, {
        keyword,
        category,
        minPrice,
        maxPrice,
        game_type,
        condition,
      });

      await db.popularSearch.upsert({
        where: { keyword },
        create: { keyword, count: 1 },
        update: { count: { increment: 1 } },
      });
    }
  }

  return products;
};

// 사용자의 최근 검색 기록 가져오기
export const getUserSearchHistory = async () => {
  const session = await getSession();
  if (!session.id) return [];

  const searchHistory = await db.searchHistory.findMany({
    where: {
      userId: session.id,
    },
    select: {
      keyword: true,
      created_at: true,
    },
    orderBy: {
      updated_at: "desc",
    },
    take: 5,
  });

  return searchHistory;
};

// 인기 검색어 가져오기
export const getPopularSearches = async () => {
  const popularSearches = await db.popularSearch.findMany({
    select: {
      keyword: true,
      count: true,
    },
    orderBy: {
      count: "desc",
    },
    take: 5,
  });

  return popularSearches;
};

// 특정 검색어 삭제
export const deleteSearchHistory = async (keyword: string) => {
  const session = await getSession();
  if (!session.id) return;

  await db.searchHistory.deleteMany({
    where: {
      userId: session.id,
      keyword,
    },
  });
};

// 전체 검색 기록 삭제
export const deleteAllSearchHistory = async () => {
  const session = await getSession();
  if (!session.id) return;

  await db.searchHistory.deleteMany({
    where: {
      userId: session.id,
    },
  });
};
