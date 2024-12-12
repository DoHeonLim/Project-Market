/**
 File Name : app/products/edit/schema
 Description : 제품 수정 스키마
 Author : 임도헌
 
 History
 Date        Author   Status    Description
 2024.11.12  임도헌   Created
 2024.11.12  임도헌   Modified  제품 수정 스키마 추가
 2024.12.12  임도헌   Modified  제품 스키마 에러 메시지 변경

 
 */

import { z } from "zod";

export const productEditSchema = z.object({
  id: z.coerce.number().optional(),
  photos: z.array(
    z.string({
      required_error: "최소 1개 이상의 사진을 넣어주세요.",
    })
  ),
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

export type ProductEditType = z.infer<typeof productEditSchema>;
