/**
 * File Name : lib/post/comment/delete/deleteComment
 * Description : 게시글 댓글 삭제 서버 액션
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2024.07.06  임도헌   Created
 */
"use server";

import db from "@/lib/db";
import { revalidateTag } from "next/cache";

export const deleteComment = async (commentId: number, postId: number) => {
  try {
    await db.comment.delete({
      where: { id: commentId },
    });

    revalidateTag(`post-comments-${postId}`);
    return { success: true };
  } catch (e) {
    console.error("댓글 삭제 실패:", e);
    return { success: false, error: "댓글 삭제 중 오류가 발생했습니다." };
  }
};
