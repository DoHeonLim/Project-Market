/**
 File Name :app/add-product/action
 Description : 제품 업로드 폼 액션
 Author : 임도헌
 
 History
 Date        Author   Status    Description
 2024.10.17  임도헌   Created
 2024.10.17  임도헌   Modified  제품 업로드 코드 추가
 2024.10.19  임도헌   Modified  DB에 저장하는 코드 추가
 2024.11.05  임도헌   Modified  캐싱 추가
 2024.11.11  임도헌   Modified  클라우드 플레어 이미지 업로드 주소 얻는 함수 추가
 2024.12.11  임도헌   Modified  제품 업로드 함수 반환 타입 추가(성공 시 제품 ID 반환) - 클라이언트에서 redirect 처리
 2024.12.12  임도헌   Modified  products/add 에서 add-product로 이동
 2024.12.16  임도헌   Modified  제품 업로드 보드게임 유형으로 변경
 */
"use server";

import db from "@/lib/db";
import getSession from "@/lib/session";
import { productSchema } from "./schema";
import { revalidatePath, revalidateTag } from "next/cache";
import { Prisma } from "@prisma/client";

interface UploadProductResponse {
  success: boolean;
  productId?: number;
  error?: string;
  fieldErrors?: {
    [key: string]: string[];
  };
}

export const uploadProduct = async (
  formData: FormData
): Promise<UploadProductResponse> => {
  const photos = formData.getAll("photos[]").map(String);

  // 이미지 검증 추가
  if (photos.length === 0) {
    return {
      success: false,
      error: "최소 1개 이상의 이미지를 업로드해주세요.",
    };
  }

  // FormData에서 태그 데이터 추출 및 처리
  const tagsString = formData.get("tags")?.toString() || "[]";
  const tags = JSON.parse(tagsString);

  const data = {
    title: formData.get("title"),
    description: formData.get("description"),
    price: formData.get("price"),
    photos: formData.getAll("photos[]").map(String),
    game_type: formData.get("game_type"),
    min_players: formData.get("min_players"),
    max_players: formData.get("max_players"),
    play_time: formData.get("play_time"),
    condition: formData.get("condition"),
    completeness: formData.get("completeness"),
    has_manual: formData.get("has_manual") === "true",
    categoryId: formData.get("categoryId"),
    tags: tags, // 파싱된 태그 배열 사용
  };

  const results = productSchema.safeParse(data);
  if (!results.success) {
    return {
      success: false,
      fieldErrors: results.error.flatten().fieldErrors,
    };
  }

  const session = await getSession();
  if (!session.id) {
    return {
      success: false,
      error: "로그인이 필요합니다.",
    };
  }

  try {
    const productData: Prisma.ProductCreateInput = {
      title: results.data.title,
      description: results.data.description,
      price: results.data.price,
      game_type: results.data.game_type,
      min_players: results.data.min_players,
      max_players: results.data.max_players,
      play_time: results.data.play_time,
      condition: results.data.condition,
      completeness: results.data.completeness,
      has_manual: results.data.has_manual,
      category: {
        connect: {
          id: results.data.categoryId,
        },
      },
      user: {
        connect: {
          id: session.id,
        },
      },
      search_tags: {
        connectOrCreate: results.data.tags.map((tag) => ({
          where: { name: tag },
          create: { name: tag },
        })),
      },
    };

    const product = await db.product.create({
      data: productData,
    });

    // 태그 사용 횟수 증가
    await db.searchTag.updateMany({
      where: {
        name: {
          in: results.data.tags,
        },
      },
      data: {
        count: {
          increment: 1,
        },
      },
    });

    // 모든 이미지를 ProductImage 테이블에 저장
    if (results.data.photos.length) {
      await Promise.all(
        results.data.photos.map((url, index) =>
          db.productImage.create({
            data: {
              url,
              order: index,
              product: {
                connect: {
                  id: product.id,
                },
              },
            },
          })
        )
      );
    }

    revalidatePath("/products");
    revalidateTag("product-detail");
    // 성공 시 제품 ID 반환
    return {
      success: true,
      productId: product.id,
    };
  } catch (error) {
    console.error("제품 생성 중 오류 발생:", error);
    return {
      success: false,
      error: "제품 생성에 실패했습니다.",
    };
  }
};

// 클라우드 플레어 이미지에 업로드 할 수 있는 주소를 제공하는 함수
export const getUploadUrl = async () => {
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${process.env.NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID}/images/v2/direct_upload`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_CLOUDFLARE_IMAGE_TOKEN}`,
      },
    }
  );
  const data = await response.json();
  return data;
};
