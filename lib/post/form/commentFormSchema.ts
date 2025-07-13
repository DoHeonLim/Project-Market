/**
 File Name : lib/post/form/commentFormSchema
 Description : 게시글 댓글 스키마
 Author : 임도헌
 
 History
 Date        Author   Status    Description
 2025.07.06  임도헌   Created
 2025.07.06  임도헌   Modified  게시글 댓글 스키마 actions에서 분리
*/

import { z } from "zod";

export const commentFormSchema = z.object({
  postId: z.coerce.number(),
  payload: z
    .string({ required_error: "댓글을 입력해주세요." })
    .min(2, "댓글은 최소 2자 이상 입력해주세요."),
});
export type CommentFormValues = z.infer<typeof commentFormSchema>;
