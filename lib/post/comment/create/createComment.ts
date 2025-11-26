/**
 * File Name : lib/post/comment/create/createComment
 * Description : 게시글 댓글 생성 서버 액션
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2024.07.06  임도헌   Created
 * 2025.11.20  임도헌   Modified  revalidate 태그 네이밍 통일
 */

"use server";

import db from "@/lib/db";
import getSession from "@/lib/session";
import { revalidateTag } from "next/cache";
import {
  badgeChecks,
  checkBoardExplorerBadge,
} from "@/lib/check-badge-conditions";
import { commentFormSchema } from "../../form/commentFormSchema";

export const createComment = async (formData: FormData) => {
  const data = {
    payload: formData.get("payload"),
    postId: formData.get("postId"),
  };

  const session = await getSession();
  const result = commentFormSchema.safeParse(data);

  if (!result.success) {
    return { success: false, error: "유효성 검사 실패" };
  }

  try {
    const comment = await db.comment.create({
      data: {
        payload: result.data.payload,
        postId: result.data.postId,
        userId: session.id!,
      },
    });

    // 뱃지 체크
    await badgeChecks.onCommentCreate(session.id!);

    // 게시글 작성자에 대한 탐험가 뱃지 체크
    const post = await db.post.findUnique({
      where: { id: result.data.postId },
      select: { userId: true },
    });
    if (post) await checkBoardExplorerBadge(post.userId);

    revalidateTag(`post-comments-id-${result.data.postId}`);

    return { success: true, id: comment.id };
  } catch (e) {
    console.error("댓글 작성 실패:", e);
    return { success: false, error: "댓글 작성 실패" };
  }
};
