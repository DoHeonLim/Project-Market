/**
File Name : app/posts/add/actions
Description : 동네생활 게시글 생성 서버 코드
Author : 임도헌

History
Date        Author   Status    Description
2024.11.23  임도헌   Created
2024.11.23  임도헌   Modified  동네생활 게시글 생성 코드 추가
2024.12.10  임도헌   Modified  이미지 여러개 업로드 코드 추가
*/
"use server";

import db from "@/lib/db";
import getSession from "@/lib/session";
import { revalidatePath, revalidateTag } from "next/cache";
import { postSchema } from "./schema";

export const uploadPost = async (formData: FormData) => {
  const data = {
    title: formData.get("title"),
    description: formData.get("description"),
    photos: formData.getAll("photos[]").map(String),
  };

  const results = postSchema.safeParse(data);
  if (!results.success) {
    return results.error.flatten();
  }

  const session = await getSession();
  if (session.id) {
    try {
      // 1. 게시글 생성
      const post = await db.post.create({
        data: {
          title: results.data.title,
          description: results.data.description,
          user: {
            connect: {
              id: session.id,
            },
          },
        },
      });

      // 2. 이미지 URL이 있다면 PostImage 테이블에 순서와 함께 저장
      if (results.data.photos?.length) {
        await Promise.all(
          results.data.photos.map((url, index) =>
            db.postImage.create({
              data: {
                url,
                order: index,
                post: {
                  connect: {
                    id: post.id,
                  },
                },
              },
            })
          )
        );
      }

      revalidatePath("/life");
      revalidateTag("post-detail");
    } catch (error) {
      console.error("게시글 생성 중 오류 발생:", error);
      throw new Error("게시글 생성에 실패했습니다.");
    }
  }
};
