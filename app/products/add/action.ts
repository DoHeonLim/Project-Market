/**
 File Name : app/products/add/action
 Description : 제품 업로드 폼 액션
 Author : 임도헌
 
 History
 Date        Author   Status    Description
 2024.10.17  임도헌   Created
 2024.10.17  임도헌   Modified  제품 업로드 코드 추가
 2024.10.19  임도헌   Modified  DB에 저장하는 코드 추가
 2024.11.11  임도헌   Modified  클라우드 플레어 이미지 업로드 주소 얻는 함수 추가
 */
"use server";

// import fs from "fs/promises";
import db from "@/lib/db";
import getSession from "@/lib/session";
import { redirect } from "next/navigation";
import { productSchema } from "./schema";

export const uploadProduct = async (FormData: FormData) => {
  const data = {
    photo: FormData.get("photo"),
    title: FormData.get("title"),
    price: FormData.get("price"),
    description: FormData.get("description"),
  };
  // 이미지를 로컬에 업로드
  // if (data.photo instanceof File) {
  //   const photoData = await data.photo.arrayBuffer();
  //   await fs.appendFile(`./public/${data.photo.name}`, Buffer.from(photoData));
  //   data.photo = `/${data.photo.name}`;
  // }
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
