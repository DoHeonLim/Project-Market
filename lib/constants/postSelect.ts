/**
 File Name : lib/constants/postSelect
 Description : 게시글글 select 쿼리 상수
 Author : 임도헌
 
 History
 Date        Author   Status    Description
 2025.05.29  임도헌   Created
 2025.05.29  임도헌   Modified  기존 select 쿼리 상수로 분리
*/
import { Prisma } from "@prisma/client";

export const POST_SELECT: Prisma.PostSelect = {
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
};
