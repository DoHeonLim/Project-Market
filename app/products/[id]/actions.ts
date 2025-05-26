/**
File Name : app/products/[id]/actions.ts
Description : 제품 상세보기 서버 코드
Author : 임도헌

History
Date        Author   Status    Description
2024.12.12  임도헌   Created
2024.12.12  임도헌   Modified  제품 상세보기 서버 코드 추가
2024.12.17  임도헌   Modified  page에 있는 서버 코드들 전부 actions로 옮김
2024.12.22  임도헌   Modified  채팅방 생성 함수 변경, 제품 캐싱 함수 변경
2025.05.23  임도헌   Modified  카테고리 필드명 변경(name->kor_name)
*/
"use server";

import db from "@/lib/db";
import getSession from "@/lib/session";
import { unstable_cache as nextCache, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";

// =========== 제품 정보 관련 함수 ===========

/**
 * 제품 상세 정보를 가져오는 함수
 * @param id 제품 ID
 * @returns 제품 상세 정보 또는 null
 */
export const getProduct = async (id: number) => {
  try {
    const product = await db.product.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            username: true,
            avatar: true,
          },
        },
        images: {
          orderBy: {
            order: "asc",
          },
          select: {
            url: true,
            order: true,
          },
        },
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
        search_tags: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!product) return null;
    return product;
  } catch (e) {
    console.log(e);
    return null;
  }
};

/**
 * 제품 상세 정보 캐싱 함수
 */
export const getCachedProduct = (id: number) => {
  return nextCache(() => getProduct(id), [`product-detail-${id}`], {
    tags: ["product-detail", `product-views-${id}`],
  })();
};

/**
 * 제품 제목을 가져오는 함수 (메타데이터용)
 */
export const getProductTitle = async (id: number) => {
  const product = await db.product.findUnique({
    where: { id },
    select: { title: true },
  });
  return product;
};

/**
 * 제품 제목 캐싱 함수
 */
export const getCachedProductTitle = (id: number) => {
  return nextCache(() => getProductTitle(id), [`product-title-${id}`], {
    tags: ["product-title"],
  })();
};

// =========== 조회수 관련 함수 ===========

/**
 * 제품 조회수 증가 함수
 */
const incrementProductViews = async (id: number) => {
  try {
    const result = await db.product.update({
      where: { id },
      data: {
        views: { increment: 1 },
      },
      select: { views: true },
    });

    revalidateTag(`product-views-${id}`);
    return result.views;
  } catch (error) {
    console.error("조회수 업데이트 중 오류 발생:", error);
    return null;
  }
};

/**
 * 제품 조회수 증가 후 조회수 반환 함수
 */
export const getCachedProductWithViews = async (id: number) => {
  const result = await incrementProductViews(id);
  return result;
};

// =========== 좋아요 관련 함수 ===========

/**
 * 제품 좋아요 상태 확인 함수
 */
const getProductLikeStatus = async (productId: number, userId: number) => {
  const isLiked = await db.productLike.findUnique({
    where: {
      id: {
        productId,
        userId,
      },
    },
  });
  const likeCount = await db.productLike.count({
    where: { productId },
  });
  return {
    likeCount,
    isLiked: Boolean(isLiked),
  };
};

/**
 * 제품 좋아요 상태 캐싱 함수
 */
export const getCachedProductLikeStatus = async (productId: number) => {
  const session = await getSession();
  const userId = session.id;
  const cachedOperation = nextCache(
    getProductLikeStatus,
    [`product-like-status-${productId}`],
    {
      tags: [`product-like-status-${productId}`],
    }
  );
  return cachedOperation(productId, userId!);
};

/**
 * 제품 좋아요 추가 함수
 */
export const likeProduct = async (productId: number) => {
  const session = await getSession();
  await db.productLike.create({
    data: {
      user: { connect: { id: session.id! } },
      product: { connect: { id: productId } },
    },
  });
  revalidateTag(`product-like-status-${productId}`);
};

/**
 * 제품 좋아요 취소 함수
 */
export const dislikeProduct = async (productId: number) => {
  const session = await getSession();
  await db.productLike.delete({
    where: {
      id: {
        userId: session.id!,
        productId,
      },
    },
  });
  revalidateTag(`product-like-status-${productId}`);
};

// =========== 사용자 권한 관련 함수 ===========

/**
 * 제품 소유자 체크 함수
 * @param userId 유저 ID
 * @returns 소유자 여부
 */
export const getIsOwner = async (userId: number) => {
  const session = await getSession();
  if (session.id) {
    return session.id === userId;
  }
  return false;
};

// =========== 채팅 관련 함수 ===========

/**
 * 제품에 대한 채팅방 생성 함수
 * @param productId 제품 ID
 * @returns 생성된 채팅방으로 리다이렉트
 */
export const createChatRoom = async (productId: number) => {
  const session = await getSession();
  if (!session.id) {
    throw new Error("로그인이 필요합니다.");
  }

  // 제품 정보와 판매자 정보 가져오기
  const product = await db.product.findUnique({
    where: { id: productId },
    select: {
      userId: true, // 판매자 ID
    },
  });

  if (!product) {
    throw new Error("존재하지 않는 제품입니다.");
  }

  // 기존 채팅방 확인
  const existingRoom = await db.productChatRoom.findFirst({
    where: {
      productId,
      users: {
        every: {
          id: {
            in: [product.userId, session.id], // productId 대신 판매자 ID 사용
          },
        },
      },
    },
    select: { id: true },
  });

  if (existingRoom) {
    revalidateTag("chat-list");
    return redirect(`/chats/${existingRoom.id}`);
  }

  // 새 채팅방 생성
  const room = await db.productChatRoom.create({
    data: {
      users: {
        connect: [{ id: product.userId }, { id: session.id }],
      },
      product: {
        connect: { id: productId },
      },
    },
    select: { id: true },
  });

  revalidateTag("chat-list");
  redirect(`/chats/${room.id}`);
};
