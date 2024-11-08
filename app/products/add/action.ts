/**
 File Name : app/products/add/action
 Description : 제품 업로드 폼 액션
 Author : 임도헌
 
 History
 Date        Author   Status    Description
 2024.10.17  임도헌   Created
 2024.10.17  임도헌   Modified  제품 업로드 코드 추가
 2024.10.19  임도헌   Modified  DB에 저장하는 코드 추가
 */
"use server";

import { z } from "zod";
import fs from "fs/promises";
import db from "@/lib/db";
import getSession from "@/lib/session";
import { redirect } from "next/navigation";

const productSchema = z.object({
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

export const uploadProduct = async (_: any, FormData: FormData) => {
  const data = {
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
  if (!results.success) {
    return results.error.flatten();
  } else {
    const session = await getSession();
    if (session.id) {
      const product = await db.product.create({
        data: {
          title: results.data.title,
          description: results.data.description,
          price: results.data.price,
          photo: results.data.photo,
          user: {
            connect: {
              id: session.id,
            },
          },
        },
        select: {
          id: true,
        },
      });
      redirect(`/products/${product.id}`);
    }
  }
  console.log(results);
};
