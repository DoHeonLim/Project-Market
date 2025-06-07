/**
 File Name : lib/constants/productSelect
 Description : 공통 제품 select 쿼리 상수
 Author : 임도헌
 
 History
 Date        Author   Status    Description
 2025.05.29  임도헌   Created
 2025.05.29  임도헌   Modified  기존 select 쿼리 상수로 분리
*/

export const PRODUCT_SELECT = {
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
      eng_name: true,
      icon: true,
      parent: {
        select: {
          kor_name: true,
          eng_name: true,
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
};
