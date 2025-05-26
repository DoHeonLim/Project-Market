/**
 File Name : app/streams/actions
 Description : 라이브 스트리밍 server 코드
 Author : 임도헌
 
 History
 Date        Author   Status    Description
 2024.05.16  임도헌   Created
 2025.05.16  임도헌   Modified  라이브 스트리밍 서버 코드 추가
 */
"use server";

import db from "@/lib/db";
import getSession from "@/lib/session";

// 내 방송 목록 조회
export const getMyStreams = async (userId: number, take: number) => {
  return await db.liveStream.findMany({
    where: { userId },
    orderBy: { created_at: "desc" },
    take,
    include: {
      user: { select: { username: true, avatar: true } },
      category: true,
      tags: true,
    },
  });
};

export async function getStreams(category?: string) {
  const session = await getSession();
  // 먼저 카테고리 정보를 가져옵니다
  let categoryIds: number[] = [];

  if (category) {
    const parentCategory = await db.streamCategory.findFirst({
      where: { eng_name: category },
      include: {
        children: true,
      },
    });

    if (parentCategory) {
      // 부모 카테고리 ID와 자식 카테고리 ID들을 모두 포함
      categoryIds = [
        parentCategory.id,
        ...parentCategory.children.map((child) => child.id),
      ];
    }
  }

  // 내가 팔로우한 유저 목록 가져오기
  const following = session?.id
    ? await db.follow.findMany({
        where: { followerId: session.id },
        select: { followingId: true },
      })
    : [];
  const followingIds = following.map((f) => f.followingId);

  const streams = await db.liveStream.findMany({
    where: {
      // 카테고리가 있으면 부모/자식 카테고리 모두 검색, 없으면 전체
      ...(category && {
        streamCategoryId: {
          in: categoryIds,
        },
      }),
      // CONNECTED 상태의 방송만 가져오기
      status: "CONNECTED",
    },
    select: {
      id: true,
      title: true,
      description: true,
      thumbnail: true,
      status: true,
      visibility: true,
      password: true,
      started_at: true,
      ended_at: true,
      user: {
        select: {
          id: true,
          username: true,
          avatar: true,
        },
      },
      category: {
        select: {
          kor_name: true,
          icon: true,
        },
      },
      tags: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      started_at: "desc",
    },
  });

  // 각 방송에 대해 팔로우 상태와 본인 여부 추가
  return streams.map((stream) => ({
    ...stream,
    isFollowing: followingIds.includes(stream.user.id),
    isMine: session?.id === stream.user.id,
  }));
}

// 유저별 방송 목록 조회
export async function getUserStreams(username: string) {
  const decodedUsername = decodeURIComponent(username);
  return await db.liveStream.findMany({
    where: {
      user: {
        username: decodedUsername,
      },
    },
    include: {
      user: {
        select: {
          username: true,
          avatar: true,
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
          _count: {
            select: {
              followers: true,
              following: true,
            },
          },
        },
      },
      category: true,
      tags: true,
    },
    orderBy: { created_at: "desc" },
  });
}
