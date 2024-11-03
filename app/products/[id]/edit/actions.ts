/**
File Name : app/products/[id]/edit/actions
Description : 제품 편집 폼 액션
Author : 임도헌

History
Date        Author   Status    Description
2024.11.02  임도헌   Created
2024.11.02  임도헌   Modified  제품 편집 폼 액션
*/
"use server";

import { z } from "zod";
import fs from "fs/promises";
import db from "@/lib/db";
import getSession from "@/lib/session";
import { redirect } from "next/navigation";
import { revalidatePath, revalidateTag } from "next/cache";

const productSchema = z.object({
  id: z.coerce.number().optional(),
  photo: z.string({
    required_error: "사진을 넣어주세요.",
  }),
  title: z.string({
    required_error: "제목을 입력해주세요.",
  }),
  description: z.string({
    required_error: "설명을 입력해주세요.",
  }),
  price: z.coerce.number({
    required_error: "가격을 입력해주세요.",
  }),
});

export const editProduct = async (prevState: any, FormData: FormData) => {
  const data = {
    id: FormData.get("id"),
    photo: FormData.get("photo"),
    title: FormData.get("title"),
    price: FormData.get("price"),
    description: FormData.get("description"),
  };
  if (data.photo instanceof File) {
    const photoData = await data.photo.arrayBuffer();
    await fs.appendFile(`./public/${data.photo.name}`, Buffer.from(photoData));
    data.photo = `/${data.photo.name}`;
  }
  const results = productSchema.safeParse(data);
  console.log(results);
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
