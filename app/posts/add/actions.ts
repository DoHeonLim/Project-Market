/**
File Name : app/posts/add/actions
Description : 동네생활 게시글 생성 서버 코드
Author : 임도헌

History
Date        Author   Status    Description
2024.11.23  임도헌   Created
2024.11.23  임도헌   Modified  동네생활 게시글 생성 코드 추가
*/
"use server";

import getSession from "@/lib/session";
import { postSchema } from "./schema";
import db from "@/lib/db";
import { redirect } from "next/navigation";
import { revalidatePath, revalidateTag } from "next/cache";

export const uploadPost = async (formData: FormData) => {
  const data = {
    title: formData.get("title"),
    description: formData.get("description"),
  };
  const results = postSchema.safeParse(data);
  if (!results.success) {
    return results.error.flatten();
  } else {
    const session = await getSession();
    if (session.id) {
      await db.post.create({
        data: {
          title: results.data.title,
          description: results.data.description,
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
      revalidatePath("/life");
      revalidateTag("post-detail");
      redirect("/life");
    }
  }
};
