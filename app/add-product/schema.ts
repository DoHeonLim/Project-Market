/**
 File Name : app/add-product/schema
 Description : 제품 스키마
 Author : 임도헌
 
 History
 Date        Author   Status    Description
 2024.11.11  임도헌   Created
 2024.11.11  임도헌   Modified  제품 스키마 추가
2024.12.12  임도헌   Modified  products/add 에서 add-product로 이동

 
*/
import { z } from "zod";

export const productSchema = z.object({
  title: z.string({
    required_error: "제목을 입력해주세요.",
  }),
  description: z.string({
    required_error: "설명을 입력해주세요.",
  }),
  price: z.coerce.number({
    required_error: "가격을 입력해주세요.",
  }),
  photos: z.array(
    z.string({
      required_error: "최소 1개 이상의 사진을 넣어주세요.",
    })
  ),
});

export type ProductType = z.infer<typeof productSchema>;
