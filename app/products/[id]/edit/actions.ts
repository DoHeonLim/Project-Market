/**
File Name : app/products/[id]/edit/actions
Description : 제품 편집 폼 액션
Author : 임도헌

History
Date        Author   Status    Description
2024.11.02  임도헌   Created
2024.11.02  임도헌   Modified  제품 편집 폼 액션
2024.11.12  임도헌   Modified  제품 수정 클라우드 플레어로 리팩토링
*/
"use server";

// import fs from "fs/promises";
import db from "@/lib/db";
import getSession from "@/lib/session";
import { redirect } from "next/navigation";
import { revalidatePath, revalidateTag } from "next/cache";
import { productEditSchema } from "./schema";

export const editProduct = async (FormData: FormData) => {
  const data = {
    id: FormData.get("id"),
    photo: FormData.get("photo"),
    title: FormData.get("title"),
    price: FormData.get("price"),
    description: FormData.get("description"),
  };
  // if (data.photo instanceof File) {
  //   const photoData = await data.photo.arrayBuffer();
  //   await fs.appendFile(`./public/${data.photo.name}`, Buffer.from(photoData));
  //   data.photo = `/${data.photo.name}`;
  // }
  const results = productEditSchema.safeParse(data);
  if (!results.success) {
    return results.error.flatten();
  } else {
    const session = await getSession();
    if (session.id) {
      const updateProduct = await db.product.update({
        where: {
          id: results.data.id,
        },
        data: {
          title: results.data.title,
          description: results.data.description,
          price: results.data.price,
          photo: results.data.photo,
        },
        select: {
          id: true,
        },
      });
      revalidatePath("/products");
      revalidateTag("product-detail");
      redirect(`/products/${updateProduct.id}`);
    }
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
