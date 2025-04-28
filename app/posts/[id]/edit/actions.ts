/**
File Name : app/posts/[id]/edit/actions
Description : 게시글 편집 폼 액션
Author : 임도헌

History
Date        Author   Status    Description
2025.04.21  임도헌   Created
2025.04.21  임도헌   Modified  게시글 편집 폼 액션 추가
*/
"use server";

import db from "@/lib/db";
import getSession from "@/lib/session";
import { revalidatePath, revalidateTag } from "next/cache";
import { postEditSchema } from "./schema";

// 해당 게시글의 정보와 태그 가져온다.
export const getPost = async (id: number) => {
  try {
    const post = await db.post.findUnique({
      where: { id },
      include: {
        tags: { select: { name: true } },
        images: {
          orderBy: {
            order: "asc",
          },
        },
      },
    });
    return post;
  } catch (e) {
    console.log(e);
    return null;
  }
};

export const editPost = async (formData: FormData) => {
  const tagsString = formData.get("tags")?.toString() || "[]";
  const tags = JSON.parse(tagsString);

  const data = {
    id: formData.get("id"),
    title: formData.get("title"),
    category: formData.get("category"),
    description: formData.get("description"),
    photos: formData.getAll("photos[]").map(String),
    tags,
  };

  const results = postEditSchema.safeParse(data);
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
    await db.postImage.deleteMany({
      where: {
        postId: results.data.id,
      },
    });

    // 기존 태그 연결 해제
    await db.post.update({
      where: { id: results.data.id },
      data: {
        tags: {
          set: [], // 기존 태그 연결 모두 해제
        },
      },
    });

    // 게시글 업데이트
    const updatedPost = await db.post.update({
      where: { id: results.data.id },
      data: {
        title: results.data.title,
        description: results.data.description,
        category: results.data.category,
        tags: {
          connectOrCreate: results.data.tags?.map((tag) => ({
            where: { name: tag },
            create: { name: tag },
          })),
        },
      },
    });

    // 새 이미지 추가
    if (results.data.photos && results.data.photos.length > 0) {
      await Promise.all(
        results.data.photos.map((url, index) =>
          db.postImage.create({
            data: {
              url,
              order: index,
              post: {
                connect: {
                  id: updatedPost.id,
                },
              },
            },
          })
        )
      );
    }

    revalidatePath(`/posts`);
    revalidateTag("post-detail");
    return {
      success: true,
      postId: updatedPost.id,
    };
  } catch (error) {
    console.error("게시글 수정 중 오류 발생생:", error);
    return {
      success: false,
      error: "게시글 수정에 실패했습니다.",
    };
  }
}
