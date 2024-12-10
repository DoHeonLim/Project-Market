/**
 File Name : app/posts/add/schema
 Description : 게시글 스키마
 Author : 임도헌
 
 History
 Date        Author   Status    Description
 2024.11.23  임도헌   Created
 2024.11.23  임도헌   Modified  게시글 스키마 추가
 2024.12.10  임도헌   Modified  게시글 photos 필드 추가(optional) 
*/

import { z } from "zod";

export const postSchema = z.object({
  title: z
    .string({
      required_error: "제목을 적어주세요.",
    })
    .min(5, "5자 이상 적어주세요."),
  description: z.string({
    required_error: "내용을 적어주세요.",
  }),
  photos: z.array(z.string()).optional(),
});

export type PostType = z.infer<typeof postSchema>;
