/**
File Name : app/products/[id]/edit/actions
Description : 제품 편집 폼 액션
Author : 임도헌

History
Date        Author   Status    Description
2024.11.02  임도헌   Created
2024.11.02  임도헌   Modified  제품 편집 폼 액션
2024.11.12  임도헌   Modified  제품 수정 클라우드 플레어로 리팩토링
2024.12.12  임도헌   Modified  제품 편집 폼 액션 코드 추가(여러 이미지 업로드)
2025.04.18  읻모헌   Modified  타입 상수 constants로 이동
2025.05.23  임도헌   Modified  카테고리 필드명 변경(name->kor_name)
*/
"use server";

import db from "@/lib/db";
import getSession from "@/lib/session";
import { revalidatePath, revalidateTag } from "next/cache";
import { productEditSchema } from "./schema";
import {
  COMPLETENESS_TYPES,
  CONDITION_TYPES,
  GAME_TYPES,
} from "@/lib/constants";

export const editProduct = async (formData: FormData) => {
  const photos = formData.getAll("photos[]").map(String);
  const tagsString = formData.get("tags")?.toString() || "[]";
  const tags = JSON.parse(tagsString);

  // 이미지 검증 추가
  if (photos.length === 0) {
    return {
      success: false,
      error: "최소 1개 이상의 이미지를 업로드해주세요.",
    };
  }

  const data = {
    id: formData.get("id"),
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
    tags: tags,
  };

  const results = productEditSchema.safeParse(data);
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
    // 기존 이미지 삭제
    await db.productImage.deleteMany({
      where: {
        productId: results.data.id,
      },
    });

    // 기존 태그 연결 해제
    await db.product.update({
      where: { id: results.data.id },
      data: {
        search_tags: {
          set: [], // 기존 태그 연결 모두 해제
        },
      },
    });

    // 제품 정보 업데이트
    const updateProduct = await db.product.update({
      where: {
        id: results.data.id,
      },
      data: {
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
        search_tags: {
          connectOrCreate: results.data.tags.map((tag) => ({
            where: { name: tag },
            create: { name: tag },
          })),
        },
      },
    });

    // 새 이미지 추가
    await Promise.all(
      results.data.photos.map((url, index) =>
        db.productImage.create({
          data: {
            url,
            order: index,
            product: {
              connect: {
                id: updateProduct.id,
              },
            },
          },
        })
      )
    );

    revalidatePath("/products");
    revalidateTag("product-detail");
    return {
      success: true,
      productId: updateProduct.id,
    };
  } catch (error) {
    console.error("제품 수정 중 오류 발생:", error);
    return {
      success: false,
      error: "제품 수정에 실패했습니다.",
    };
  }
};

// 제품 타입 정의
type GameType = (typeof GAME_TYPES)[number];
type ConditionType = (typeof CONDITION_TYPES)[number];
type CompletenessType = (typeof COMPLETENESS_TYPES)[number];

interface ProductWithDetails {
  id: number;
  title: string;
  images: {
    url: string;
    order: number;
  }[];
  description: string;
  price: number;
  game_type: GameType;
  min_players: number;
  max_players: number;
  play_time: string;
  condition: ConditionType;
  completeness: CompletenessType;
  has_manual: boolean;
  categoryId: number;
  userId: number;
  search_tags: {
    name: string;
  }[];
}

export async function getProduct(
  id: number
): Promise<ProductWithDetails | null> {
  const product = await db.product.findUnique({
    where: { id },
    include: {
      images: {
        orderBy: {
          order: "asc",
        },
        select: {
          url: true,
          order: true,
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

  return product as ProductWithDetails;
}

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

// 카테고리 조회
export async function getCategories() {
  try {
    const categories = await db.category.findMany({
      orderBy: {
        kor_name: "asc",
      },
    });
    return categories;
  } catch (error) {
    console.error("카테고리 조회 중 오류 발생:", error);
    return [];
  }
}
