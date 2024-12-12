/**
File Name : app/products/[id]/actions.ts
Description : 제품 상세보기 서버 코드
Author : 임도헌

History
Date        Author   Status    Description
2024.12.12  임도헌   Created
2024.12.12  임도헌   Modified  제품 상세보기 서버 코드 추가
*/
"use server";

import db from "@/lib/db";
import getSession from "@/lib/session";
import { revalidateTag } from "next/cache";

export const likeProduct = async (productId: number) => {
  const session = await getSession();
  await db.productLike.create({
    data: {
      user: {
        connect: {
          id: session.id!,
        },
      },
      product: {
        connect: {
          id: productId,
        },
      },
    },
  });
  revalidateTag(`product-like-status-${productId}`);
};

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
