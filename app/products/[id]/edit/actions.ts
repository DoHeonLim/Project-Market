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
*/
"use server";

// import fs from "fs/promises";
import db from "@/lib/db";
import getSession from "@/lib/session";
import { revalidatePath, revalidateTag } from "next/cache";
import { productEditSchema } from "./schema";

export const editProduct = async (FormData: FormData) => {
  const photos = FormData.getAll("photos[]").map(String);

  // 이미지 검증 추가
  if (photos.length === 0) {
    return {
      success: false,
      error: "최소 1개 이상의 이미지를 업로드해주세요.",
    };
  }

  const data = {
    id: FormData.get("id"),
    photos: FormData.getAll("photos[]").map(String),
    title: FormData.get("title"),
    price: FormData.get("price"),
    description: FormData.get("description"),
  };

  const results = productEditSchema.safeParse(data);
  if (!results.success) {
    return {
      success: false,
      fieldErrors: results.error.flatten().fieldErrors,
    };
  }

  const session = await getSession();
  if (session.id) {
    try {
      // 기존 이미지 삭제
      await db.productImage.deleteMany({
        where: {
          productId: results.data.id,
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
  }
  return {
    success: false,
    error: "권한이 없습니다.",
  };
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
