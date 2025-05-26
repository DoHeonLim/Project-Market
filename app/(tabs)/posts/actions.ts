/**
File Name : app/(tabs)/posts/actions.ts
Description : 항해일지 페이지 액션
Author : 임도헌

History
Date        Author   Status    Description
2025.05.06  임도헌   Created
2025.05.06  임도헌   Modified  게시글 페이지 액션 추가
*/
"use server";

import db from "@/lib/db";

// PostItem 타입 정의
export interface PostItem {
  id: number;
  title: string;
  created_at: Date;
  images: {
    url: string;
  }[];
  category: string;
  views: number;
  _count: {
    comments: number;
    post_likes: number;
  };
  description: string | null;
  user: {
    username: string;
    avatar: string | null;
  };
  tags: {
    name: string;
  }[];
}

export async function getPosts(
  category?: string,
  keyword?: string
): Promise<PostItem[]> {
  const posts = await db.post.findMany({
    where: {
      // 카테고리가 있으면 필터링, 없으면 전체
      ...(category && { category }),
      // 검색어가 있는 경우 제목 또는 내용에서 검색
      ...(keyword && {
        OR: [
          { title: { contains: keyword } },
          { description: { contains: keyword } },
        ],
      }),
    },
    select: {
      id: true,
      title: true,
      description: true,
      category: true,
      views: true,
      created_at: true,
      user: {
        select: {
          username: true,
          avatar: true,
        },
      },
      tags: {
        select: {
          name: true,
        },
      },
      images: {
        select: {
          url: true,
        },
        take: 1,
      },
      _count: {
        select: {
          comments: true,
          post_likes: true,
        },
      },
    },
    orderBy: {
      created_at: "desc",
    },
  });
  return posts;
}
